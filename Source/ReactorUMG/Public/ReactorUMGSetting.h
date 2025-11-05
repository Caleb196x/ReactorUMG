#pragma once
#include "CoreMinimal.h"
#include "Engine/DeveloperSettings.h"
#include "ReactorUMGSetting.generated.h"

UCLASS(Config = ReactorUMG, DefaultConfig, meta = (DisplayName = "ReactorUMG"))
class REACTORUMG_API UReactorUMGSetting : public UDeveloperSettings
{
	GENERATED_BODY()
public:
	UReactorUMGSetting();
	
	UPROPERTY(EditAnywhere,
		  config,
		  Category = "ReactorUMG",
		  DisplayName = "TypeScript Code Home Directory")
	FString TsScriptProjectDir;

	UPROPERTY(EditAnywhere, config,
		Category = "ReactorUMG",
		DisplayName = "Generate TypeScript projects automatically",
		meta = (ToolTip =
			"If the option is set, the system will automatically generate a TypeScript project. If not, you need to manually create a TS project, manually generate a type file, and set TsScriptProjectDir to a custom path."))
	bool bAutoGenerateTSProject;

	virtual FName GetCategoryName() const override
	{
		return FName(TEXT("ReactorUMG"));
	}
};
