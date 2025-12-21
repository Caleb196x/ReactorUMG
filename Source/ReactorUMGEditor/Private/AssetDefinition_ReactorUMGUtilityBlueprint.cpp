#include "AssetDefinition_ReactorUMGUtilityBlueprint.h"
// Core includes
#if ENGINE_MAJOR_VERSION == 5 && ENGINE_MINOR_VERSION < 2
#include "EditorUtilitySubsystem.h"
#endif
#include "ReactorUMGUtilityWidgetBlueprint.h"
#include "Misc/MessageDialog.h"
#include "WidgetBlueprintEditor.h"

AssetDefinition_ReactorUMGUtilityBlueprintAssetTypeActions::AssetDefinition_ReactorUMGUtilityBlueprintAssetTypeActions(EAssetTypeCategories::Type InCategories)
	: Categories(InCategories)
{
};

FText AssetDefinition_ReactorUMGUtilityBlueprintAssetTypeActions::GetName() const
{
	return NSLOCTEXT("ReactorUMGBlueprint", "ReactorUMGBlueprintAssetTypeActions_Name", "EditorUtilityUMG");
}

UClass* AssetDefinition_ReactorUMGUtilityBlueprintAssetTypeActions::GetSupportedClass() const
{
	return UReactorUMGUtilityWidgetBlueprint::StaticClass();
}

FColor AssetDefinition_ReactorUMGUtilityBlueprintAssetTypeActions::GetTypeColor() const
{
	return FColor(14, 27, 226);
}

void AssetDefinition_ReactorUMGUtilityBlueprintAssetTypeActions::OpenAssetEditor(const TArray<UObject*>& InObjects, TSharedPtr<IToolkitHost> EditWithinLevelEditor)
{
	EToolkitMode::Type Mode = EditWithinLevelEditor.IsValid() ? EToolkitMode::WorldCentric : EToolkitMode::Standalone;
	// FMessageDialog::Open(EAppMsgType::Ok, NSLOCTEXT("SmartUIBlueprint", "FailedToOpenBlueprint", "Not support open editor"));

	for (auto ObjIt = InObjects.CreateConstIterator(); ObjIt; ++ObjIt)
	{
		auto Blueprint = Cast<UBlueprint>(*ObjIt);
		if (Blueprint && Blueprint->SkeletonGeneratedClass && Blueprint->GeneratedClass)
		{
			if (UReactorUMGUtilityWidgetBlueprint* WidgetBlueprint = Cast<UReactorUMGUtilityWidgetBlueprint>(Blueprint))
			{
				WidgetBlueprint->SetupMonitorForTsScripts();
			}
			
			TSharedRef<FWidgetBlueprintEditor> NewBlueprintEditor(new FWidgetBlueprintEditor());
			
			TArray<UBlueprint*> Blueprints;
			Blueprints.Add(Blueprint);

			NewBlueprintEditor->InitWidgetBlueprintEditor(Mode, EditWithinLevelEditor, Blueprints, false);
		}
		else
		{
			FMessageDialog::Open(EAppMsgType::Ok, NSLOCTEXT("ReactorUMGBlueprint", "FailedToLoadBlueprint",
				"Blueprint could not be loaded because it derives from an invalid class.  Check to make sure the parent class for this blueprint hasn't been removed!"));
		}
	}
}

uint32 AssetDefinition_ReactorUMGUtilityBlueprintAssetTypeActions::GetCategories()
{
	return Categories;
}

#if ENGINE_MAJOR_VERSION == 5 && ENGINE_MINOR_VERSION < 2
void AssetDefinition_ReactorUMGUtilityBlueprintAssetTypeActions::GetActions(const TArray<UObject*>& InObjects, FToolMenuSection& Section)
{
	auto Blueprints = GetTypedWeakObjectPtrs<UWidgetBlueprint>(InObjects);

	Section.AddMenuEntry(
		"EditorUtilityWidget_Edit",
		NSLOCTEXT("ReactorUMGUtilityBlueprint", "EditorUtilityWidget_Edit", "Run Editor Utility Widget"),
		NSLOCTEXT("ReactorUMGUtilityBlueprint", "EditorUtilityWidget_EditTooltip", "Opens the tab built by this Editor Utility Widget Blueprint."),
		FSlateIcon(),
		FUIAction(
			FExecuteAction::CreateSP(this, &AssetDefinition_ReactorUMGUtilityBlueprintAssetTypeActions::ExecuteRun, Blueprints),
			FCanExecuteAction()
		)
	);

}

void AssetDefinition_ReactorUMGUtilityBlueprintAssetTypeActions::ExecuteRun(FWeakBlueprintPointerArray InObjects)
{
	for (auto ObjIt = InObjects.CreateConstIterator(); ObjIt; ++ObjIt)
	{
		if (UWidgetBlueprint* Blueprint = Cast<UWidgetBlueprint>(*ObjIt))
		{
			if (Blueprint->GeneratedClass->IsChildOf(UEditorUtilityWidget::StaticClass()))
			{
				UEditorUtilityWidgetBlueprint* EditorWidget = Cast<UEditorUtilityWidgetBlueprint>(Blueprint);
				if (EditorWidget)
				{
					UEditorUtilitySubsystem* EditorUtilitySubsystem = GEditor->GetEditorSubsystem<UEditorUtilitySubsystem>();
					EditorUtilitySubsystem->SpawnAndRegisterTab(EditorWidget);
				}
			}
		}
	}
}
#endif
