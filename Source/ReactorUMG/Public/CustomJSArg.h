#pragma once
#include "CustomJSArg.generated.h"

UCLASS()
class REACTORUMG_API UCustomJSArg : public UObject
{
	GENERATED_BODY()
	
public:
	UCustomJSArg();
	
	UPROPERTY(BlueprintType)
	bool bIsUsingBridgeCaller;
};
