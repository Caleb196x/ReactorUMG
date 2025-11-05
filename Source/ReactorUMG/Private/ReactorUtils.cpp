#include "ReactorUtils.h"

#include "Interfaces/IPluginManager.h"
#include "LogReactorUMG.h"
#include "ReactorUMGSetting.h"
#include "HAL/PlatformFilemanager.h"
#include "Misc/Paths.h"
#include "PuertsSetting.h"

bool FReactorUtils::CopyDirectoryRecursive(const FString& SrcDir, const FString& DestDir, const TArray<FString>& SkipExistFiles)
{
	IPlatformFile& PlatformFile = FPlatformFileManager::Get().GetPlatformFile();

	// 创建目标目录
	if (!PlatformFile.CreateDirectoryTree(*DestDir))
	{
		UE_LOG(LogReactorUMG, Error, TEXT("Failed to create destination directory: %s"), *DestDir);
		return false;
	}

	// 遍历源目录
	TArray<FString> FileNames;
	PlatformFile.FindFilesRecursively(FileNames, *SrcDir, TEXT(""));

	for (FString& SourcePath : FileNames)
	{
		// 构建目标路径
		FString RelativePath = SourcePath;
		FPaths::MakePathRelativeTo(RelativePath, *SrcDir);
		FString DestPath = FPaths::Combine(*DestDir, *RelativePath);

		if (CheckNameExistInArray(SkipExistFiles, RelativePath)
			&& FPaths::FileExists(DestPath))
		{
			continue;
		}

		// 创建目标子目录
		FString DestSubDir = FPaths::GetPath(DestPath);
		if (!PlatformFile.DirectoryExists(*DestSubDir))
		{
			PlatformFile.CreateDirectoryTree(*DestSubDir);
		}

		// 执行文件拷贝
		if (!PlatformFile.CopyFile(*DestPath, *SourcePath))
		{ 
			UE_LOG(LogReactorUMG, Warning, TEXT("Failed to copy file: %s"), *SourcePath);
		}
	}

	return true;
}

void FReactorUtils::CopyFile(const FString& SrcFile, const FString& DestFile)
{
	IPlatformFile& PlatformFile = FPlatformFileManager::Get().GetPlatformFile();

	const FString DestDir = FPaths::GetPath(DestFile);
	if (!PlatformFile.DirectoryExists(*DestDir))
	{
		PlatformFile.CreateDirectoryTree(*DestDir);
	}

	if (!PlatformFile.CopyFile(*DestFile, *SrcFile))
	{ 
		UE_LOG(LogReactorUMG, Warning, TEXT("Failed to copy file: %s"), *SrcFile);
	}
}

void FReactorUtils::DeleteFile(const FString& FilePath)
{
	if (FPaths::FileExists(FilePath))
	{
		IPlatformFile& PlatformFile = FPlatformFileManager::Get().GetPlatformFile();
		PlatformFile.DeleteFile(*FilePath);
	}
}

FString FReactorUtils::GetPluginContentDir()
{
	return FPaths::ConvertRelativePathToFull(IPluginManager::Get().FindPlugin("ReactorUMG")->GetContentDir());
}

FString FReactorUtils::GetPluginDir()
{
	return FPaths::ConvertRelativePathToFull(IPluginManager::Get().FindPlugin("ReactorUMG")->GetBaseDir());

}

bool FReactorUtils::DeleteDirectoryRecursive(const FString& DirPath)
{
	IPlatformFile& PlatformFile = FPlatformFileManager::Get().GetPlatformFile();
	
	if (PlatformFile.DirectoryExists(*DirPath))
	{
		// 删除目录及其内容
		return PlatformFile.DeleteDirectoryRecursively(*DirPath);
	}
	
	UE_LOG(LogReactorUMG, Log, TEXT("Directory does not exist: %s"), *DirPath);
	return true;
}

bool FReactorUtils::CreateDirectoryRecursive(const FString& DirPath)
{
	IPlatformFile& PlatformFile = FPlatformFileManager::Get().GetPlatformFile();
	if (!PlatformFile.DirectoryExists(*DirPath))
	{
		return PlatformFile.CreateDirectoryTree(*DirPath);
	}
	return true;
}

FString FReactorUtils::GetTypeScriptHomeDir()
{
	const UReactorUMGSetting* PluginSettings = GetDefault<UReactorUMGSetting>();
	FString ScriptHomeDir = PluginSettings->TsScriptProjectDir;
	if (ScriptHomeDir.IsEmpty())
	{
		ScriptHomeDir = TEXT("TypeScript");
	}

	if (ScriptHomeDir.StartsWith("/Game"))
	{
		return FPackageName::LongPackageNameToFilename(ScriptHomeDir);
	}

	return FPaths::Combine(FPaths::ProjectDir(), ScriptHomeDir);
}

FString FReactorUtils::GetGamePlayTSHomeDir()
{
	const FString ProjectName = FApp::GetProjectName();
	const FString TSGamePlayHomeDir = FPaths::Combine(GetTypeScriptHomeDir(), TEXT("src"), ProjectName);
	if (!FPaths::DirectoryExists(TSGamePlayHomeDir))
	{
		if (CreateDirectoryRecursive(TSGamePlayHomeDir))
		{
			return TSGamePlayHomeDir;
		}
	}

	return TSGamePlayHomeDir;
}

FString FReactorUtils::GetGamePlayStartPoint()
{
	const FString ProjectName = FApp::GetProjectName();
	const FString DestDir = GetDefault<UPuertsSetting>()->RootPath;
	return FPaths::Combine(FPaths::ProjectContentDir(), DestDir, TEXT("src"), ProjectName, TEXT("start_game.js"));
}

bool FReactorUtils::CheckNameExistInArray(const TArray<FString>& SkipExistFiles, const FString& CheckName)
{
	for (const FString& FileName : SkipExistFiles)
	{
		if (FileName == CheckName)
		{
			return true;
		}

		FString NameWithoutExt = FPaths::GetCleanFilename(CheckName);
		if (FileName == NameWithoutExt)
		{
			return true;
		}
	}

	return false;
}

bool FReactorUtils::ReadFileContent(const FString& FilePath, FString& OutContent)
{
	if (FPaths::FileExists(FilePath))
	{
		return FFileHelper::LoadFileToString(OutContent, *FilePath);
	}
    
	UE_LOG(LogReactorUMG, Error, TEXT("Failed to read file: %s (file not found)"), *FilePath);
	return false;
}

FString FReactorUtils::ConvertRelativePathToFullUsingTSConfig(const FString& RelativePath, const FString& DirName)
{
	auto FindTSConfig = [](const FString& Dir)
    {
        FString CurrentDir = Dir;
        while (!CurrentDir.IsEmpty())
        {
            FString TSConfigPath = FPaths::Combine(CurrentDir, TEXT("tsconfig.json"));
            if (FPaths::FileExists(TSConfigPath))
            {
                return TSConfigPath; // 找到文件，返回路径
            }
            // 向上回溯到父目录
            CurrentDir = FPaths::GetPath(CurrentDir);
        }
        
        return FString(); // 没有找到，返回空字符串
    };

	FString Result = FPaths::ConvertRelativePathToFull(DirName / RelativePath);

    const FString TSConfigPath = FindTSConfig(DirName);
    if (!FPaths::FileExists(*TSConfigPath))
    {
    	return Result;
    }
	
	FString FileBuffer;
	if (!FFileHelper::LoadFileToString(FileBuffer, *TSConfigPath))
	{
		UE_LOG(LogReactorUMG, Error, TEXT("Failed to load tsconfig.json file: %s"), *TSConfigPath);
		return FString();
	}
        
	TSharedPtr<FJsonObject> JsonObject;
	TSharedRef<TJsonReader<>> JsonReader = TJsonReaderFactory<>::Create(FileBuffer);
	if (FJsonSerializer::Deserialize(JsonReader, JsonObject) && JsonObject.IsValid())
	{
		const TSharedPtr<FJsonObject>* CompileOptObject;
		if (JsonObject->TryGetObjectField(TEXT("compilerOptions"), CompileOptObject))
		{
			const TSharedPtr<FJsonObject>* PathsObject;
			if (JsonObject->TryGetObjectField(TEXT("paths"), PathsObject))
			{
				for (const auto& Pair : PathsObject->Get()->Values)
				{
					FString Key = Pair.Key.TrimStartAndEnd().Replace(TEXT("*"), TEXT(""));
					const TArray<TSharedPtr<FJsonValue>>& ValueArray = Pair.Value->AsArray();
					for (const auto& Value : ValueArray)
					{
						FString ValueString = Value->AsString().TrimStartAndEnd().Replace(TEXT("*"), TEXT(""));
						if (RelativePath.StartsWith(Key))
						{
							FString RelativePathToTSConfig = RelativePath.Replace(*Key, *ValueString);
							Result = FPaths::Combine(FPaths::GetPath(TSConfigPath), RelativePathToTSConfig);
							break;
						}
					}
				}
			}
		}
	}
	
	return Result;
}

/**
bool FReactorUtils::RunCommandWithProcess(const FString& Command, const FString& WorkDir, FScopedSlowTask* SlowTask, FString& StdOut, FString& StdErr)
{
	bool bAllocSlowTask = false;
	if (!SlowTask)
	{
		SlowTask = new FScopedSlowTask(1);
	}
	
	SlowTask->MakeDialog();
	const FString WorkDirectory = FPaths::ConvertRelativePathToFull(WorkDir);
	const int32 TotalAmountOfWorks = 20;
	
	void* ReadPipe = nullptr;
	void* WritePipe = nullptr;
	verify(FPlatformProcess::CreatePipe(ReadPipe, WritePipe));

	FString CommandLine = Command;
#if PLATFORM_WINDOWS
	CommandLine = TEXT("C:/Users/liumi/AppData/Roaming/npm/yarn.cmd build");
#else
	CommandLine = TEXT("/bin/bash -c ") + Command;
#endif
	
	const FString Arguments = TEXT("");
	uint32 ProcessID;
	FProcHandle ProcessHandle = FPlatformProcess::CreateProc(*CommandLine, *Arguments, false,
		false, false, &ProcessID, 0, *WorkDirectory, WritePipe);

	if (!ProcessHandle.Get() || ProcessID == 0)
	{
		UE_LOG(LogReactorUMG, Error, TEXT("Create process failed: %s"), *Command);
		FPlatformProcess::ClosePipe(ReadPipe, WritePipe);
		return false;
	}

	FString LogOutBuffer;
	while (FPlatformProcess::IsProcRunning(ProcessHandle))
	{
		if (SlowTask->ShouldCancel() || GEditor->GetMapBuildCancelled())
		{ 
			FPlatformProcess::TerminateProc(ProcessHandle);
			break;
		}
		
		FString LogString = FPlatformProcess::ReadPipe(ReadPipe);
		if (!LogString.IsEmpty())
		{
			LogOutBuffer += LogString;
		}
		
		// TODO@Caleb196x: 提取出编译日志
		int NewLineCount = LogString.Len() - LogString.Replace(TEXT("\n"), TEXT("")).Len();

		SlowTask->CompletedWork = NewLineCount;
		SlowTask->TotalAmountOfWork = TotalAmountOfWorks;
		// SlowTask.DefaultMessage = FText::FromString(Regex.GetCaptureGroup(3));

		SlowTask->EnterProgressFrame(0);
		FPlatformProcess::Sleep(0.1);
	}

	FString RemainingData = FPlatformProcess::ReadPipe(ReadPipe);
	if (!RemainingData.IsEmpty())
	{
		LogOutBuffer += RemainingData;
	}
	
	int32 ReturnCode = 0;
	FPlatformProcess::GetProcReturnCode(ProcessHandle, &ReturnCode);
	FPlatformProcess::ClosePipe(ReadPipe, WritePipe);

	UE_LOG(LogReactorUMG, Display, TEXT("Log: %s"), *LogOutBuffer);
	
	if (ReturnCode == 0)
	{
		UE_LOG(LogReactorUMG, Display, TEXT("Compile TypeScript files successfully."));
		StdOut = LogOutBuffer;
		if (bAllocSlowTask)
		{
			delete SlowTask;
		}
		
		return true;
	}

	StdErr = LogOutBuffer;
	UE_LOG(LogReactorUMG, Display, TEXT("Compile TypeScript files failed, error: %s."), *StdErr);
	if (bAllocSlowTask)
	{
		delete SlowTask;
	}
	
	return false;
}
**/

FString FReactorUtils::GetTSCBuildOutDirFromTSConfig(const FString& ProjectDir)
{
	const FString TSConfigPath = FPaths::Combine(ProjectDir, TEXT("tsconfig.json"));
	
	FString FileBuffer;
	if (!FFileHelper::LoadFileToString(FileBuffer, *TSConfigPath))
	{
		UE_LOG(LogReactorUMG, Error, TEXT("Failed to load tsconfig.json file: %s"), *TSConfigPath);
		return FString();
	}
	
	FString Result;
	
	TSharedPtr<FJsonObject> JsonObject;
	TSharedRef<TJsonReader<>> JsonReader = TJsonReaderFactory<>::Create(FileBuffer);
	if (FJsonSerializer::Deserialize(JsonReader, JsonObject) && JsonObject.IsValid())
	{
		const TSharedPtr<FJsonObject>* CompileOptObject;
		if (JsonObject->TryGetObjectField(TEXT("compilerOptions"), CompileOptObject))
		{
			if (*CompileOptObject)
			{
				const TSharedPtr<FJsonValue> OutDirValue = (*CompileOptObject)->TryGetField(TEXT("outDir"));
				if (OutDirValue)
				{
					FString OutDir = OutDirValue->AsString();
					Result = FPaths::ConvertRelativePathToFull(FPaths::Combine(ProjectDir, OutDir));
				}
			}

		}
	}
	
	return Result;
}

bool FReactorUtils::IsAnyPIERunning()
{
#if WITH_EDITOR
	if (!GEngine) return false;
	const TIndirectArray<FWorldContext>& Contexts = GEngine->GetWorldContexts();
	for (const FWorldContext& Ctx : Contexts)
	{
		if (Ctx.WorldType == EWorldType::PIE)
		{
			return true;
		}
	}
#endif
	return false;
}
