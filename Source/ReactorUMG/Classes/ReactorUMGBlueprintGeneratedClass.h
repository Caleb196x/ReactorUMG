#pragma once
// Core includes
#include "CoreMinimal.h"

// CoreUObject includes
#include "UObject/Package.h"

// Engine includes
#include "Blueprint/WidgetBlueprintGeneratedClass.h"
#include "Engine/BlueprintGeneratedClass.h"

#include "ReactorUMGBlueprintGeneratedClass.generated.h"

UCLASS()
class REACTORUMG_API UReactorUMGBlueprintGeneratedClass : public UWidgetBlueprintGeneratedClass
{
	GENERATED_UCLASS_BODY()

public:
	FString MainScriptPath;
	FString TsProjectDir;
	FString TsScriptHomeFullDir;
	FString TsScriptHomeRelativeDir;
	FString WidgetName;
};
