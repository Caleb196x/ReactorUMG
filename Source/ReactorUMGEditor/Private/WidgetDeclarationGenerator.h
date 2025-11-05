// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CodeGenerator.h"
#include "CoreMinimal.h"
#include "UObject/Object.h"
#include "WidgetDeclarationGenerator.generated.h"

UCLASS()
class REACTORUMGEDITOR_API UWidgetDeclarationGenerator : public UObject, public ICodeGenerator
{
	GENERATED_BODY()
public:
	UFUNCTION(BlueprintNativeEvent)
	void Gen(const FString& OutDir) const;

	virtual void Gen_Implementation(const FString& OutDir) const override;
};
