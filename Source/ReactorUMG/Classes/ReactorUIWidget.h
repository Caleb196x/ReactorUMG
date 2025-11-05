#pragma once
#include "CustomJSArg.h"
#include "JsEnv.h"
#include "Blueprint/UserWidget.h"
#include "ReactorUIWidget.generated.h"

UCLASS(BlueprintType)
class REACTORUMG_API UReactorUIWidget : public UUserWidget
{
	GENERATED_UCLASS_BODY()
public:
	virtual bool Initialize() override;
	virtual void BeginDestroy() override;
	
protected:
	void SetNewWidgetTree();
#if WITH_EDITOR
	virtual const FText GetPaletteCategory() override;
#endif // WITH_EDITOR
	
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

