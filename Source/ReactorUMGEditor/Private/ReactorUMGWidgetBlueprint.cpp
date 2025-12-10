#include "ReactorUMGWidgetBlueprint.h"

#include "JsEnvRuntime.h"
#include "LogReactorUMG.h"
#include "ReactorBlueprintCompilerContext.h"
#include "ReactorUMGBlueprintGeneratedClass.h"
#include "AssetRegistry/AssetRegistryModule.h"
#include "Kismet2/BlueprintEditorUtils.h"

UReactorUMGWidgetBlueprint::UReactorUMGWidgetBlueprint(const FObjectInitializer& ObjectInitializer) : Super(ObjectInitializer)
{
	if (this->HasAnyFlags(RF_ClassDefaultObject))
	{
		// do nothing for default blueprint
		return;
	}
	
	ReactorUMGCommonBP = NewObject<UReactorUMGCommonBP>(this, TEXT("ReactorUMGCommonBP_UMGBP"));
	if(!ReactorUMGCommonBP)
	{
		UE_LOG(LogReactorUMG, Warning, TEXT("Create ReactorUMGCommonBP failed, do noting."))
		return;
	}
	
	ReactorUMGCommonBP->WidgetTree = this->WidgetTree;
	ReactorUMGCommonBP->BuildAllNeedPaths(GetName(), GetPathName());

	RegisterBlueprintDeleteHandle();

#if ENGINE_MAJOR_VERSION == 5 && ENGINE_MINOR_VERSION >= 4
	FEditorDelegates::OnPreForceDeleteObjects.AddUObject(this, &UReactorUMGWidgetBlueprint::ForceDeleteAssets);
#elif ENGINE_MAJOR_VERSION == 5 && ENGINE_MINOR_VERSION < 4
	FEditorDelegates::OnAssetsPreDelete.AddUObject(this, &UReactorUMGWidgetBlueprint::ForceDeleteAssets);
#endif
}

void UReactorUMGWidgetBlueprint::ForceDeleteAssets(const TArray<UObject*>& InAssetsToDelete)
{
	if (InAssetsToDelete.Find(this) != INDEX_NONE)
	{
		FJsEnvRuntime::GetInstance().RebuildRuntimePool();
	}
}

bool UReactorUMGWidgetBlueprint::Rename(const TCHAR* NewName, UObject* NewOuter, ERenameFlags Flags)
{
	bool Res = Super::Rename(NewName, NewOuter, Flags);
	if (ReactorUMGCommonBP)
	{
		ReactorUMGCommonBP->RenameScriptDir(NewName, NewOuter);
		ReactorUMGCommonBP->WidgetName = FString(NewName);
	}
	
	return Res;
}

void UReactorUMGWidgetBlueprint::RegisterBlueprintDeleteHandle()
{
	IAssetRegistry& AssetRegistry = FModuleManager::LoadModuleChecked<FAssetRegistryModule>("AssetRegistry").Get();
	
	AssetRegistry.OnAssetRemoved().AddLambda([this](const FAssetData& AssetData)
	{
		if (this)
		{
			const FName BPName = this->GetFName();
			const FString BPPath = this->GetPathName();
			ReactorUMGCommonBP->DeleteRelativeDirectories(AssetData, BPName, BPPath);
		}
	});
}

UClass* UReactorUMGWidgetBlueprint::GetBlueprintClass() const
{
	return UReactorUMGBlueprintGeneratedClass::StaticClass();
}

bool UReactorUMGWidgetBlueprint::SupportedByDefaultBlueprintFactory() const
{
	return false;
}

void UReactorUMGWidgetBlueprint::SetupTsScripts(const FReactorUMGCompilerLog& CompilerResultsLogger, bool bForceCompile, bool bForceReload)
{
	if (ReactorUMGCommonBP)
	{
		ReactorUMGCommonBP->SetupTsScripts(CompilerResultsLogger, bForceCompile, bForceReload);
	}
}

void UReactorUMGWidgetBlueprint::SetupMonitorForTsScripts()
{
	GEditor->GetEditorSubsystem<UAssetEditorSubsystem>()->OnAssetEditorOpened().AddLambda([this](UObject* Asset)
	{
		UE_LOG(LogReactorUMG, Log, TEXT("Start TS Script Monitor -- AssetName: %s, AssetType: %s"), *Asset->GetName(), *Asset->GetClass()->GetName());
		if (ReactorUMGCommonBP)
		{
			ReactorUMGCommonBP->StartTsScriptsMonitor([this]()
			{
				if (this->MarkPackageDirty())
				{
					FBlueprintEditorUtils::MarkBlueprintAsModified(this);
					UE_LOG(LogReactorUMG, Log, TEXT("Set package reactorUMG blueprint dirty"))
				}
			});
		}
	});

#if ENGINE_MAJOR_VERSION == 5 && ENGINE_MINOR_VERSION >= 4
	GEditor->GetEditorSubsystem<UAssetEditorSubsystem>()->OnAssetClosedInEditor().AddLambda([this](
		UObject* Asset, IAssetEditorInstance* AssetEditorInstance)
	{
		if (Asset && Asset == this)
		{
			UE_LOG(LogReactorUMG, Log, TEXT("Stop TS Script Monitor -- AssetName: %s, AssetType: %s"), *Asset->GetName(), *Asset->GetClass()->GetName());
			if (ReactorUMGCommonBP)
			{
				ReactorUMGCommonBP->StopTsScriptsMonitor();
			}
		}
	});
	
#elif ENGINE_MAJOR_VERSION == 5 && ENGINE_MINOR_VERSION < 4
	GEditor->GetEditorSubsystem<UAssetEditorSubsystem>()->OnAssetEditorRequestClose().AddLambda([this](
		UObject* Asset, EAssetEditorCloseReason Reason)
	{
		if (Asset && Asset == this)
		{
			UE_LOG(LogReactorUMG, Log, TEXT("Stop TS Script Monitor -- AssetName: %s, AssetType: %s"), *Asset->GetName(), *Asset->GetClass()->GetName());
			if (ReactorUMGCommonBP)
			{
				ReactorUMGCommonBP->StopTsScriptsMonitor();
			}
		}
	});
#endif
	
}

