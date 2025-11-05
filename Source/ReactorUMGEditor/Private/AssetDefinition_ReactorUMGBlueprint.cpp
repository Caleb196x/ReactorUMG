#include "AssetDefinition_ReactorUMGBlueprint.h"
// Core includes
#include "Misc/MessageDialog.h"
#include "BlueprintEditor.h"
#include "ReactorUMGWidgetBlueprint.h"
#include "WidgetBlueprintEditor.h"

AssetDefinition_ReactorUMGBlueprintAssetTypeActions::AssetDefinition_ReactorUMGBlueprintAssetTypeActions(EAssetTypeCategories::Type InCategories)
	: Categories(InCategories)
{
};

FText AssetDefinition_ReactorUMGBlueprintAssetTypeActions::GetName() const
{
	return NSLOCTEXT("ReactorUMGBlueprint", "ReactorUMGBlueprintAssetTypeActions_Name", "ReactorUMG");
}

UClass* AssetDefinition_ReactorUMGBlueprintAssetTypeActions::GetSupportedClass() const
{
	return UReactorUMGWidgetBlueprint::StaticClass();
}

FColor AssetDefinition_ReactorUMGBlueprintAssetTypeActions::GetTypeColor() const
{
	return FColor(42, 166, 226);
}

void AssetDefinition_ReactorUMGBlueprintAssetTypeActions::OpenAssetEditor(const TArray<UObject*>& InObjects, TSharedPtr<IToolkitHost> EditWithinLevelEditor)
{
	EToolkitMode::Type Mode = EditWithinLevelEditor.IsValid() ? EToolkitMode::WorldCentric : EToolkitMode::Standalone;
	// FMessageDialog::Open(EAppMsgType::Ok, NSLOCTEXT("SmartUIBlueprint", "FailedToOpenBlueprint", "Not support open editor"));

	for (auto ObjIt = InObjects.CreateConstIterator(); ObjIt; ++ObjIt)
	{
		auto Blueprint = Cast<UBlueprint>(*ObjIt);
		if (Blueprint && Blueprint->SkeletonGeneratedClass && Blueprint->GeneratedClass)
		{
			if (UReactorUMGWidgetBlueprint* WidgetBlueprint = Cast<UReactorUMGWidgetBlueprint>(Blueprint))
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

uint32 AssetDefinition_ReactorUMGBlueprintAssetTypeActions::GetCategories()
{
	return Categories;
}

