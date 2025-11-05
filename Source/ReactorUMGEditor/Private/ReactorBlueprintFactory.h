#pragma once
#include "TypeScriptDeclarationGenerator.h"
#include "ReactorBlueprintFactory.generated.h"

struct TemplateScriptCreator
{
	TemplateScriptCreator(const FString& InTsScriptHomeFullDir, const FString& InWidgetName)
		: TsScriptHomeFullDir(InTsScriptHomeFullDir), WidgetName(InWidgetName) {};
	void GenerateTemplateLaunchScripts();
	void GenerateIndexTsFile(const FString&);
	void GenerateLaunchTsxFile(const FString&);
	void GenerateAppFile(const FString&);

	FStringBuffer GeneratedTemplateOutput;
	FString TsScriptHomeFullDir;
	FString WidgetName;
};

UCLASS(BlueprintType)
class UReactorBlueprintFactory : public UFactory
{
	GENERATED_UCLASS_BODY()
	
public:
	UPROPERTY(EditAnywhere, Category = NoesisBlueprintFactory, meta = (AllowAbstract = ""))
	TSubclassOf<class UReactorUIWidget> ParentClass;
	
	virtual UObject* FactoryCreateNew(UClass* Class, UObject* Parent, FName Name, EObjectFlags Flags, UObject* Context, FFeedbackContext* Warn) override;

	// virtual UObject* FactoryCreateFile(UClass* InClass, UObject* InParent, FName InName, EObjectFlags Flags, const FString& Filename, const TCHAR* Parms, FFeedbackContext* Warn, bool& bOutOperationCanceled) override;
	

};
