// Fill out your copyright notice in the Description page of Project Settings.


#include "ReactorUMGUtilityWidgetBlueprint.h"

#include "IDirectoryWatcher.h"
#include "JsEnvRuntime.h"
#include "LogReactorUMG.h"
#include "ReactorBlueprintCompilerContext.h"
#include "ReactorUMGBlueprintGeneratedClass.h"
#include "AssetRegistry/AssetRegistryModule.h"
#include "Kismet2/BlueprintEditorUtils.h"

UReactorUMGUtilityWidgetBlueprint::UReactorUMGUtilityWidgetBlueprint(const FObjectInitializer& ObjectInitializer) : Super(ObjectInitializer)
{
	if (this->HasAnyFlags(RF_ClassDefaultObject))
	{
		return;
	}
	
	ReactorUMGCommonBP = NewObject<UReactorUMGCommonBP>(this, TEXT("ReactorUMGCommonBP_UtilityUMGBP"));
	if(!ReactorUMGCommonBP)
	{
		UE_LOG(LogReactorUMG, Warning, TEXT("Create ReactorUMGCommonBP failed, do noting."))
		return;
	}
	
	ReactorUMGCommonBP->WidgetTree = this->WidgetTree;
	ReactorUMGCommonBP->BuildAllNeedPaths(GetName(), GetPathName(), TEXT("Editor"));

	RegisterBlueprintDeleteHandle();
	FEditorDelegates::OnPreForceDeleteObjects.AddUObject(this, &UReactorUMGUtilityWidgetBlueprint::ForceDeleteAssets);
}

void UReactorUMGUtilityWidgetBlueprint::ForceDeleteAssets(const TArray<UObject*>& InAssetsToDelete)
{
	if (InAssetsToDelete.Find(this) != INDEX_NONE)
	{
		FJsEnvRuntime::GetInstance().RebuildRuntimePool();
	}
}

bool UReactorUMGUtilityWidgetBlueprint::Rename(const TCHAR* NewName, UObject* NewOuter, ERenameFlags Flags)
{
	bool Res = Super::Rename(NewName, NewOuter, Flags);
	if (ReactorUMGCommonBP)
	{
		ReactorUMGCommonBP->RenameScriptDir(NewName, NewOuter);
		ReactorUMGCommonBP->WidgetName = FString(NewName);
	}
	
	return Res;
}

void UReactorUMGUtilityWidgetBlueprint::RegisterBlueprintDeleteHandle() const
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

UClass* UReactorUMGUtilityWidgetBlueprint::GetBlueprintClass() const
{
	return UReactorUMGBlueprintGeneratedClass::StaticClass();
}

bool UReactorUMGUtilityWidgetBlueprint::SupportedByDefaultBlueprintFactory() const
{
	return false;
}

void UReactorUMGUtilityWidgetBlueprint::SetupTsScripts(const FReactorUMGCompilerLog& CompilerResultsLogger, bool bForceCompile, bool bForceReload)
{
	if (ReactorUMGCommonBP)
	{
		ReactorUMGCommonBP->SetupTsScripts(CompilerResultsLogger, bForceCompile, bForceReload);
	}
}

void UReactorUMGUtilityWidgetBlueprint::SetupMonitorForTsScripts()
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

	GEditor->GetEditorSubsystem<UAssetEditorSubsystem>()->OnAssetClosedInEditor().AddLambda([this](
		UObject* Asset, IAssetEditorInstance* AssetEditorInstance
		)
	{
		UE_LOG(LogReactorUMG, Log, TEXT("Stop TS Script Monitor -- AssetName: %s, AssetType: %s"), *Asset->GetName(), *Asset->GetClass()->GetName());
		if (ReactorUMGCommonBP)
		{
			ReactorUMGCommonBP->StopTsScriptsMonitor();
		}
	});
}