using UnrealBuildTool;

public class ReactorUMGEditor : ModuleRules
{
    public ReactorUMGEditor(ReadOnlyTargetRules Target) : base(Target)
    {
        PCHUsage = ModuleRules.PCHUsageMode.UseExplicitOrSharedPCHs;

        PublicDependencyModuleNames.AddRange(
            new string[]
            {
                "Core",
                "UnrealEd",
            }
        );

        PrivateDependencyModuleNames.AddRange(
            new string[]
            {
                "ReactorUMG",
                "CoreUObject",
                "Engine",
                "Slate",
                "SlateCore",
                "JsEnv",
                "AssetRegistry",
                "KismetCompiler",
                "Kismet",
                "DeclarationGenerator",
                "DeveloperSettings",
                "UnrealEd",
                "Projects",
                "UMG",
                "UMGEditor",
                "DirectoryWatcher", "Blutility"
            }
        );
    }
}