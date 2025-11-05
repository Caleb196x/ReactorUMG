#include "JsEnvRuntime.h"
#include "Misc/MessageDialog.h"
#include "Logging/MessageLog.h"
#include "LogReactorUMG.h"
#include "ReactorUtils.h"
#include "PuertsSetting.h"

void FReactorUMGJSLogger::Log(const FString& Message) const
{
	UE_LOG(LogReactorUMG, Log, TEXT("%s"), *Message)
}

void FReactorUMGJSLogger::Error(const FString& Message) const
{
	UE_LOG(LogReactorUMG, Error, TEXT("%s"), *Message)
#if WITH_EDITOR
	FMessageLog(FName(MessageLogCategoryName)).Error()
		->AddToken(FTextToken::Create(FText::FromString(Message)));
#endif
}

void FReactorUMGJSLogger::Warn(const FString& Message) const
{
	UE_LOG(LogReactorUMG, Warning, TEXT("%s"), *Message)
#if WITH_EDITOR
	FMessageLog(FName(MessageLogCategoryName)).Warning()
		->AddToken(FTextToken::Create(FText::FromString(Message)));
#endif
}

void FReactorUMGJSLogger::Info(const FString& Message) const
{
	UE_LOG(LogReactorUMG, Display, TEXT("%s"), *Message)
}

FJsEnvRuntime::FJsEnvRuntime(int32 EnvPoolSize)
{
	int32 DebugPort = GetDefault<UPuertsSetting>()->DebugPort;
	ReactorUmgLogger = std::make_shared<FReactorUMGJSLogger>();
	this->EnvPoolSize = EnvPoolSize;
	for (int32 i = 0; i < EnvPoolSize; i++)
	{
		TSharedPtr<puerts::FJsEnv> JsEnv = MakeShared<puerts::FJsEnv>(
		std::make_unique<puerts::DefaultJSModuleLoader>(TEXT("JavaScript")),
		ReactorUmgLogger, DebugPort + i + 3);
		JsRuntimeEnvPool.Add(JsEnv, 0);
	}
}

FJsEnvRuntime::~FJsEnvRuntime()
{
	JsRuntimeEnvPool.Empty();
}

TSharedPtr<puerts::FJsEnv> FJsEnvRuntime::GetFreeJsEnv()
{
	TSharedPtr<puerts::FJsEnv> JsEnv = nullptr;
	for (auto& Pair : JsRuntimeEnvPool)
	{
		if (Pair.Value == 0)
		{
			JsEnv = Pair.Key;
			Pair.Value = 1;
			break;
		}
	}

	return JsEnv;
}

bool FJsEnvRuntime::StartJavaScript(const TSharedPtr<puerts::FJsEnv>& JsEnv, const FString& Script, const TArray<TPair<FString, UObject*>>& Arguments) const
{
	if (JsEnv)
	{
		JsEnv->Start(Script, Arguments);
		return true;
	}

	return false;
}

bool FJsEnvRuntime::CheckScriptLegal(const FString& Script) const
{
	// const FString JSContentDir = FPaths::ProjectContentDir() / TEXT("JavaScript");
	const FString FullPath = Script.EndsWith(TEXT(".js")) ? Script : Script + TEXT(".js");
	
	if (!FPaths::FileExists(FullPath))
	{
		UE_LOG(LogReactorUMG, Error, TEXT("can't find script: %s"), *Script);
		return false;
	}
	
	return true;
}

void FJsEnvRuntime::ReleaseJsEnv(TSharedPtr<puerts::FJsEnv> JsEnv)
{
	for (auto& Pair : JsRuntimeEnvPool)
	{
		auto Key = Pair.Key;
		if (Key.Get() == JsEnv.Get())
		{
			JsEnv->Release();
			Pair.Value = 0;
			break;
		}
	}
}

void FJsEnvRuntime::RebuildRuntimePool()
{
	for (auto& Pair : JsRuntimeEnvPool)
	{
		auto Key = Pair.Key;
		Key.Reset();
	}

	JsRuntimeEnvPool.Empty();

	int32 DebugPort = GetDefault<UPuertsSetting>()->DebugPort;
	ReactorUmgLogger = std::make_shared<FReactorUMGJSLogger>();
	for (int32 i = 0; i < EnvPoolSize; i++)
	{
		TSharedPtr<puerts::FJsEnv> JsEnv = MakeShared<puerts::FJsEnv>(
		std::make_unique<puerts::DefaultJSModuleLoader>(TEXT("JavaScript")),
		ReactorUmgLogger, DebugPort + i + 3);
		JsRuntimeEnvPool.Add(JsEnv, 0);
	}
}

void FJsEnvRuntime::RestartJsScripts(
	const FString& JSContentDir, const FString& ScriptHomeDir,
	const FString& MainJsScript,  const TArray<TPair<FString, UObject*>>& Arguments
	)
{
	const FString JsScriptHomeDir = FPaths::Combine(JSContentDir, ScriptHomeDir);
	if (JsScriptHomeDir.IsEmpty() || !FPaths::DirectoryExists(JsScriptHomeDir))
	{
		UE_LOG(LogReactorUMG, Warning, TEXT("Script home directory not exists."))
		return;
	}

	IPlatformFile& PlatformFile = FPlatformFileManager::Get().GetPlatformFile();
	TArray<FString> FileNames;
	PlatformFile.FindFilesRecursively(FileNames, *JsScriptHomeDir, TEXT(""));

	auto FileShouldReload = [&](const FString& FilePath)
	{
		return FilePath.EndsWith(TEXT(".js")) || FilePath.EndsWith(TEXT(".css"));
	};
	
	TMap<FString, FString> ModuleNames;
	for (FString& SourcePath : FileNames)
	{
		if (!FileShouldReload(SourcePath))
		{
			continue;
		}
		
		FString RelativePath = SourcePath;
		FPaths::MakePathRelativeTo(RelativePath, *JSContentDir);
		RelativePath.RemoveFromStart(TEXT("JavaScript/"));

		ModuleNames.Add(RelativePath, SourcePath);
	}

	// TODO@Caleb196x: 可以记录文件的hash值，通过对比hash值，当文件有修改时，才重新加载文件。
	for (const auto& ModulePair : ModuleNames)
	{
		FString FileContent;
		if (FReactorUtils::ReadFileContent(ModulePair.Value, FileContent))
		{
			for (auto& Pair : JsRuntimeEnvPool)
			{
				auto Env = Pair.Key;
				Env->ReloadModule(FName(*ModulePair.Key), FileContent);
				Env->ForceReloadJsFile(ModulePair.Value);
			}
		}
	}
	
	for (auto& Pair : JsRuntimeEnvPool)
	{
		auto Env = Pair.Key;
		Env->Release();
		Env->ForceReloadJsFile(MainJsScript);
		Env->Start(MainJsScript, Arguments);
		Env->Release();
	}
}