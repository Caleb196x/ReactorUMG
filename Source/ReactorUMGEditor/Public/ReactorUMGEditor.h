#pragma once

#include "CoreMinimal.h"
#include "Modules/ModuleManager.h"

class FReactorUMGEditorModule : public IModuleInterface
{
public:
    virtual void StartupModule() override;
    virtual void ShutdownModule() override;

    void InstallTsScriptNodeModules();
    
    TSharedPtr<class AssetDefinition_ReactorUMGBlueprintAssetTypeActions> TestBlueprintAssetTypeActions;
    TSharedPtr<class AssetDefinition_ReactorUMGUtilityBlueprintAssetTypeActions> EditorUtilityAssetTypeActions;
    TSharedPtr<class FReactorUMGBlueprintCompiler> ReactorUMGBlueprintCompiler;
    TUniquePtr<FAutoConsoleCommand> ConsoleCommand;

    TUniquePtr<FAutoConsoleCommand> DebugGCConsoleCommand;
};
