#include "ReactorBlueprintCompiler.h"
#include "ReactorUMGBlueprintGeneratedClass.h"
#include "ReactorUIWidget.h"
#include "ReactorBlueprintCompilerContext.h"
#include "ReactorUMGUtilityWidgetBlueprint.h"
#include "ReactorUMGWidgetBlueprint.h"

bool FReactorUMGBlueprintCompiler::CanCompile(const UBlueprint* Blueprint)
{
	return Blueprint->IsA(UReactorUMGWidgetBlueprint::StaticClass()) || Blueprint->IsA(UReactorUMGUtilityWidgetBlueprint::StaticClass());
}

void FReactorUMGBlueprintCompiler::PostCompile(UBlueprint* Blueprint)
{
	
}

void FReactorUMGBlueprintCompiler::PreCompile(UBlueprint* Blueprint)
{
	
}

void FReactorUMGBlueprintCompiler::Compile(UBlueprint* Blueprint, const FKismetCompilerOptions& CompilerOptions, FCompilerResultsLog& Results)
{
	// todo: convert typescript to javascript: run tsc command
	if (UReactorUMGWidgetBlueprint* WidgetBlueprint = Cast<UReactorUMGWidgetBlueprint>(Blueprint))
	{
		FReactorUMGBlueprintCompilerContext Compiler(WidgetBlueprint, Results, CompilerOptions);
		Compiler.Compile();
		check(Compiler.NewClass);
	}

	if (UReactorUMGUtilityWidgetBlueprint* WidgetBlueprint = Cast<UReactorUMGUtilityWidgetBlueprint>(Blueprint))
	{
		FReactorUMGBlueprintCompilerContext Compiler(WidgetBlueprint, Results, CompilerOptions);
		Compiler.Compile();
		check(Compiler.NewClass);
	}
}

bool FReactorUMGBlueprintCompiler::GetBlueprintTypesForClass(UClass* ParentClass, UClass*& OutBlueprintClass, UClass*& OutBlueprintGeneratedClass) const
{
	if (ParentClass->IsChildOf<UReactorUIWidget>())
	{
		OutBlueprintClass = UReactorUMGWidgetBlueprint::StaticClass();
		OutBlueprintGeneratedClass = UReactorUMGBlueprintGeneratedClass::StaticClass();
		return true;
	}

	return false;
}




