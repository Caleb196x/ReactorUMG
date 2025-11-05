#pragma once
#include "EditorUtilityWidget.h"
#include "JsEnv.h"
#include "ReactorUtilityWidget.generated.h"

class UCustomJSArg;

UCLASS(meta = (ShowWorldContextPin), config = Editor)
class UReactorUtilityWidget : public UEditorUtilityWidget
{
	GENERATED_UCLASS_BODY()
public:
	virtual bool Initialize() override;
	virtual void BeginDestroy() override;
	
protected:
	void SetupNewWidgetTree();
	virtual const FText GetPaletteCategory() override;
	
private:
	void RunScriptToInitWidgetTree();
	void ReleaseJsEnv();

	UPROPERTY()
	TObjectPtr<UCustomJSArg> CustomJSArg;
	
	FString LaunchScriptPath;
	FString TsProjectDir;
	FString TsScriptHomeRelativeDir;
	TSharedPtr<puerts::FJsEnv> JsEnv;
	bool bWidgetTreeInitialized;
};
