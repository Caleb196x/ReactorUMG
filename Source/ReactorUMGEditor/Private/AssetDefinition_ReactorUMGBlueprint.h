#pragma once
#include "AssetTypeActions_Base.h"

class AssetDefinition_ReactorUMGBlueprintAssetTypeActions : public FAssetTypeActions_Base
{
public:
	AssetDefinition_ReactorUMGBlueprintAssetTypeActions(EAssetTypeCategories::Type Categories);

	// IAssetTypeActions interface
	virtual FText GetName() const override;
	virtual UClass* GetSupportedClass() const override;
	virtual FColor GetTypeColor() const override;
	virtual void OpenAssetEditor(const TArray<UObject*>& InObjects, TSharedPtr<IToolkitHost> EditWithinLevelEditor) override;
	virtual uint32 GetCategories() override;
	// End of IAssetTypeActions interface

private:
	EAssetTypeCategories::Type Categories;
};

