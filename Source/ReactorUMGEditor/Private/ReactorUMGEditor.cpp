#include "ReactorUMGEditor.h"

#include "ReactorUMGWidgetBlueprint.h"
#include "ReactorBlueprintCompilerContext.h"
#include "ReactorBlueprintCompiler.h"
#include "AssetToolsModule.h"
#include "CodeGenerator.h"
#include "JsEnvRuntime.h"
#include "LogReactorUMG.h"
#include "Widgets/Notifications/SNotificationList.h"
#include "Framework/Notifications/NotificationManager.h"
#include "ReactorUtils.h"
#include "TypeScriptDeclarationGenerator.h"
#include "AssetDefinition_ReactorUMGBlueprint.h"
#include "AssetDefinition_ReactorUMGUtilityBlueprint.h"
#include "ReactorUMGSetting.h"
#include "ReactorUMGUtilityWidgetBlueprint.h"

#define LOCTEXT_NAMESPACE "FReactorUMGEditorModule"

void ShowGeneratedDialog(const FString& OutDir)
{
	FString DialogMessage = FString::Printf(TEXT("Type files genertate finished! \n *.d.ts store in %s"), *OutDir);

	FText DialogText = FText::Format(LOCTEXT("PluginButtonDialogText", "{0}"), FText::FromString(DialogMessage));
	FNotificationInfo Info(DialogText);
	Info.bFireAndForget = true;
	Info.FadeInDuration = 0.0f;
	Info.FadeOutDuration = 5.0f;
	FSlateNotificationManager::Get().AddNotification(Info);
}


TArray<UObject*> GetSortedClasses(bool GenStruct = false, bool GenEnum = false)
{
	TArray<UObject*> SortedClasses;
	for (TObjectIterator<UClass> It; It; ++It)
	{
		SortedClasses.Add(*It);
	}

	if (GenStruct)
	{
		for (TObjectIterator<UScriptStruct> It; It; ++It)
		{
			SortedClasses.Add(*It);
		}
	}

	if (GenEnum)
	{
		for (TObjectIterator<UEnum> It; It; ++It)
		{
			SortedClasses.Add(*It);
		}
	}

	SortedClasses.Sort([&](const UObject& ClassA, const UObject& ClassB) -> bool { return ClassA.GetName() < ClassB.GetName(); });

	return SortedClasses;
}

void GenerateUEDeclaration(const FName& SearchPath, bool GenFull)
{
	const FString TypesHomeDir = FPaths::Combine(FReactorUtils::GetTypeScriptHomeDir(), TEXT("src"), TEXT("types"));
	FReactorUtils::CreateDirectoryRecursive(TypesHomeDir);
	
	FTypeScriptDeclarationGenerator Generator;
	Generator.OutDir = TypesHomeDir;
	Generator.RestoreBlueprintTypeDeclInfos(GenFull);
	Generator.LoadAllWidgetBlueprint(SearchPath, GenFull);
	Generator.GenTypeScriptDeclaration(true, true);

	TArray<UObject*> SortedClasses(GetSortedClasses());
	for (int i = 0; i < SortedClasses.Num(); ++i)
	{
		UClass* Class = Cast<UClass>(SortedClasses[i]);
		if (Class && Class->ImplementsInterface(UCodeGenerator::StaticClass()))
		{
			// ICodeGenerator::Execute_Gen(Class->GetDefaultObject(), TypesHomeDir);
		}
	}
}

TUniquePtr<FAutoConsoleCommand> RegisterConsoleCommand()
{
	return MakeUnique<FAutoConsoleCommand>(TEXT("ReactorUMG.GenDTS"), TEXT("Generate *.d.ts type files"),
		FConsoleCommandWithArgsDelegate::CreateLambda([](const TArray<FString>& Args)
		{
			bool GenFull = false;
			 FName SearchPath = NAME_None;

			 for (auto& Arg : Args)
			 {
				 if (Arg.ToUpper().Equals(TEXT("FULL")))
				 {
					 GenFull = true;
				 }
				 else if (Arg.StartsWith(TEXT("PATH=")))
				 {
					 SearchPath = *Arg.Mid(5);
				 }
			 }

			GenerateUEDeclaration(SearchPath, GenFull);
			const FString TypesHomeDir = FPaths::Combine(FReactorUtils::GetTypeScriptHomeDir(), TEXT("src"), TEXT("types"));
			ShowGeneratedDialog(TypesHomeDir);
		}));
}


TUniquePtr<FAutoConsoleCommand> RegisterDebugGCConsoleCommand()
{
	return MakeUnique<FAutoConsoleCommand>(TEXT("ReactorUMG.DebugFullGC"), TEXT("Request full gc in js"),
		FConsoleCommandWithArgsDelegate::CreateLambda([](const TArray<FString>& Args)
		{
			FJsEnvRuntime::GetInstance().RebuildRuntimePool();
			UE_LOG(LogReactorUMG, Display, TEXT("Request full gc finished~"));

		}));
}

void CopyPredefinedTSProject()
{
	const FString PredefineDir = FPaths::Combine(FReactorUtils::GetPluginDir(), TEXT("Scripts"), TEXT("Project"));
	if (FPaths::DirectoryExists(PredefineDir))
	{
		const FString TSProjectDir = FReactorUtils::GetTypeScriptHomeDir();
		if (!FPaths::DirectoryExists(TSProjectDir))
		{
			FReactorUtils::CreateDirectoryRecursive(TSProjectDir);
			FReactorUtils::CopyDirectoryTree(PredefineDir, TSProjectDir, false);
		} else
		{
			// only copy reactor umg lib
			const FString ReactorUMGLib = FPaths::Combine(PredefineDir, TEXT("src/reactorUMG"));
			if (FPaths::DirectoryExists(ReactorUMGLib))
			{
				/*const FString DestLibPath = FPaths::Combine(TSProjectDir, TEXT("src/reactorUMG"));
				FReactorUtils::CopyDirectoryTree(ReactorUMGLib, DestLibPath, true);*/
			}
		}
	}
}

void CopyPredefinedSystemJSFiles()
{
	const FString SysJSFileDir = FPaths::Combine(FReactorUtils::GetPluginDir(), TEXT("Scripts"),
		TEXT("System"), TEXT("JavaScript"));
	if (FPaths::DirectoryExists(SysJSFileDir))
	{
		const FString DestDir = FPaths::Combine(FPaths::ProjectContentDir(), TEXT("JavaScript"));
		FReactorUtils::CreateDirectoryRecursive(DestDir);

		FReactorUtils::CopyDirectoryTree(SysJSFileDir, DestDir, false);
	}
}

void SetJSDirToNonAssetPackageList()
{
	FString ConfigFilePath = FPaths::ConvertRelativePathToFull(FPaths::ProjectConfigDir() / TEXT("DefaultGame.ini"));

	FString Section = TEXT("/Script/UnrealEd.ProjectPackagingSettings");
	FString Key = TEXT("DirectoriesToAlwaysStageAsUFS");
	FString PathToStage = TEXT("(Path=\"JavaScript\")");
	
	TArray<FString> ExistingValues;
	GConfig->GetArray(*Section, *Key, ExistingValues, ConfigFilePath);
	if (!ExistingValues.Contains(PathToStage))
	{
		ExistingValues.Add(PathToStage);
		GConfig->SetArray(*Section, *Key, ExistingValues, ConfigFilePath);
		GConfig->Flush(false, ConfigFilePath);
	}
}

void SetupAutoExecGenDTSCommand()
{
	FString ConfigFilePath = FPaths::ConvertRelativePathToFull(FPaths::ProjectConfigDir() / TEXT("DefaultEditor.ini"));

	FString Section = TEXT("/Script/UnrealEd.EditorEngine");
	FString Key = TEXT("ExecCmds");
	FString PathToStage = TEXT("ReactorUMG.GenDTS");
	
	TArray<FString> ExistingValues;
	GConfig->GetArray(*Section, *Key, ExistingValues, ConfigFilePath);

	if (!ExistingValues.Contains(PathToStage))
	{
		ExistingValues.Add(PathToStage);
		GConfig->SetArray(*Section, *Key, ExistingValues, ConfigFilePath);
		GConfig->Flush(false, ConfigFilePath);
	}
}

TSharedPtr<FKismetCompilerContext> GetCompilerForReactorBlueprint(UBlueprint* Blueprint, FCompilerResultsLog& Results, const FKismetCompilerOptions& CompilerOptions)
{
	UWidgetBlueprint* UMGBlueprint = CastChecked<UWidgetBlueprint>(Blueprint);
	return TSharedPtr<FKismetCompilerContext>(new FReactorUMGBlueprintCompilerContext(UMGBlueprint, Results, CompilerOptions));
}

void FReactorUMGEditorModule::InstallTsScriptNodeModules()
{
	const FString TsProjectDir = FReactorUtils::GetTypeScriptHomeDir();
	const FString PackageJson = FPaths::Combine(TsProjectDir, TEXT("package.json"));

	if (FPaths::FileExists(PackageJson))
	{
		// do nothing
	}
	else
	{
		UE_LOG(LogReactorUMG, Warning, TEXT("package.json not found in %s do not any installing"), *TsProjectDir);
	}
}

void FReactorUMGEditorModule::StartupModule()
{
	IAssetTools& AssetTools = FModuleManager::LoadModuleChecked<FAssetToolsModule>("AssetTools").Get();

	EAssetTypeCategories::Type Category = AssetTools.RegisterAdvancedAssetCategory(FName(TEXT("ReactorUMG")),
		LOCTEXT("ReactorUMGCategory", "ReactorUMG"));
	TestBlueprintAssetTypeActions = MakeShareable(new AssetDefinition_ReactorUMGBlueprintAssetTypeActions(Category));
	EditorUtilityAssetTypeActions = MakeShareable(new AssetDefinition_ReactorUMGUtilityBlueprintAssetTypeActions(Category));
	
	AssetTools.RegisterAssetTypeActions(TestBlueprintAssetTypeActions.ToSharedRef());
	AssetTools.RegisterAssetTypeActions(EditorUtilityAssetTypeActions.ToSharedRef());

	// Register blueprint compiler
	ReactorUMGBlueprintCompiler = MakeShareable(new FReactorUMGBlueprintCompiler());
	IKismetCompilerInterface& KismetCompilerModule = FModuleManager::LoadModuleChecked<IKismetCompilerInterface>("KismetCompiler");
	KismetCompilerModule.GetCompilers().Insert(ReactorUMGBlueprintCompiler.Get(), 0); // Make sure our compiler goes before the WidgetBlueprint compiler
	FKismetCompilerContext::RegisterCompilerForBP(UReactorUMGWidgetBlueprint::StaticClass(), &GetCompilerForReactorBlueprint);
	FKismetCompilerContext::RegisterCompilerForBP(UReactorUMGUtilityWidgetBlueprint::StaticClass(), &GetCompilerForReactorBlueprint);
	
	CopyPredefinedSystemJSFiles();
	ConsoleCommand = RegisterConsoleCommand();

	DebugGCConsoleCommand = RegisterDebugGCConsoleCommand();
	
	const UReactorUMGSetting* PluginSettings = GetDefault<UReactorUMGSetting>();
	if (PluginSettings->bAutoGenerateTSProject)
	{
		CopyPredefinedTSProject();
		SetupAutoExecGenDTSCommand();
	}
	
	SetJSDirToNonAssetPackageList();
}

void FReactorUMGEditorModule::ShutdownModule()
{
    
}

#undef LOCTEXT_NAMESPACE
    
IMPLEMENT_MODULE(FReactorUMGEditorModule, ReactorUMGEditor)