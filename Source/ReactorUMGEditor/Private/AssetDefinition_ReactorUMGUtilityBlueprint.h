#pragma once

#include "AssetTypeActions_Base.h"

class AssetDefinition_ReactorUMGUtilityBlueprintAssetTypeActions : public FAssetTypeActions_Base
{
public:
	AssetDefinition_ReactorUMGUtilityBlueprintAssetTypeActions(EAssetTypeCategories::Type Categories);

	// IAssetTypeActions interface
	virtual FText GetName() const override;
	virtual UClass* GetSupportedClass() const override;
	virtual FColor GetTypeColor() const override;
	virtual void OpenAssetEditor(const TArray<UObject*>& InObjects, TSharedPtr<IToolkitHost> EditWithinLevelEditor) override;
	virtual uint32 GetCategories() override;

#if ENGINE_MAJOR_VERSION == 5 && ENGINE_MINOR_VERSION < 2
	virtual void GetActions(const TArray<UObject*>& InObjects, struct FToolMenuSection& Section) override;
#endif
	// End of IAssetTypeActions interface

private:
	EAssetTypeCategories::Type Categories;
	
#if ENGINE_MAJOR_VERSION == 5 && ENGINE_MINOR_VERSION < 2
	typedef TArray< TWeakObjectPtr<class UWidgetBlueprint> > FWeakBlueprintPointerArray;
	void ExecuteRun(FWeakBlueprintPointerArray Objects);
#endif
};
