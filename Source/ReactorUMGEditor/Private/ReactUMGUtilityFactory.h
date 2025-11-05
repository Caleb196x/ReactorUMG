#pragma once
#include "EditorUtilityWidgetBlueprintFactory.h"
#include "ReactUMGUtilityFactory.generated.h"

UCLASS(BlueprintType)
class UReactUMGUtilityFactory : public UFactory
{
	GENERATED_UCLASS_BODY()
public:
	UPROPERTY(EditAnywhere, Category = NoesisBlueprintFactory, meta = (AllowAbstract = ""))
	TSubclassOf<class UEditorUtilityWidget> ParentClass;
	
	// UFactory interface
	virtual bool ShouldShowInNewMenu() const override { return true; }
	virtual UObject* FactoryCreateNew(UClass* Class, UObject* Parent, FName Name, EObjectFlags Flags, UObject* Context, FFeedbackContext* Warn) override;
	virtual bool CanCreateNew() const override { return true; }
};