#include "ReactUMGUtilityFactory.h"

#include "ReactorBlueprintFactory.h"
#include "ReactorUMGUtilityWidgetBlueprint.h"
#include "Kismet2/KismetEditorUtilities.h"
#include "ReactorUIWidget.h"
#include "ReactorUtils.h"
#include "EditorUtilityWidget.h"
#include "ReactorUtilityWidget.h"

UReactUMGUtilityFactory::UReactUMGUtilityFactory(const FObjectInitializer& ObjectInitializer)
	: Super(ObjectInitializer)
{
	bCreateNew = true;
	bEditAfterNew = true;
	SupportedClass = UReactorUMGUtilityWidgetBlueprint::StaticClass();
	ParentClass = UReactorUtilityWidget::StaticClass();
}

UObject* UReactUMGUtilityFactory::FactoryCreateNew(UClass* Class, UObject* Parent, FName Name, EObjectFlags Flags, UObject* Context, FFeedbackContext* Warn)
{
	// TODO@Caleb196x: 检查用于是否安装yarn, tsc, npm等必须依赖环境，否则禁止创建ReactorUMG蓝图类，并给出安装提示
	check(Class->IsChildOf(UEditorUtilityWidgetBlueprint::StaticClass()));
	
	if ((ParentClass == nullptr) || !FKismetEditorUtilities::CanCreateBlueprintOfClass(ParentClass))
	{
		FFormatNamedArguments Args;
		Args.Add(TEXT("ClassName"), (ParentClass != nullptr) ? FText::FromString(ParentClass->GetName()) : NSLOCTEXT("ReactorUIWidget", "Null", "(null)"));
		FMessageDialog::Open(EAppMsgType::Ok, FText::Format(NSLOCTEXT("ReactorUIWidget", "CannotCreateBlueprintFromClass", "Cannot create a blueprint based on the class '{ClassName}'."), Args));
		return nullptr;
	}

	const FString WidgetName = Name.ToString();
	const FString WidgetBPPathName = Parent->GetPathName();

	const FString TsScriptHomeFullDir = FPaths::Combine(FReactorUtils::GetGamePlayTSHomeDir(), TEXT("Editor"), WidgetBPPathName.Mid(5));
	FReactorUtils::CreateDirectoryRecursive(TsScriptHomeFullDir);
	TemplateScriptCreator Generator(TsScriptHomeFullDir, WidgetName);
	Generator.GenerateTemplateLaunchScripts();
	
	return CastChecked<UReactorUMGUtilityWidgetBlueprint>(FKismetEditorUtilities::CreateBlueprint(ParentClass, Parent, Name, BPTYPE_Normal,
		UReactorUMGUtilityWidgetBlueprint::StaticClass(), UBlueprintGeneratedClass::StaticClass(),
		"UReactUMGUtilityFactory"));
}
