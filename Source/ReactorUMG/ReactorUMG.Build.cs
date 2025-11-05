// Copyright Epic Games, Inc. All Rights Reserved.

using UnrealBuildTool;

public class ReactorUMG : ModuleRules
{
	public ReactorUMG(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = ModuleRules.PCHUsageMode.UseExplicitOrSharedPCHs;
		
		PublicIncludePaths.AddRange(
			new string[] {
				// ... add public include paths required here ...
				// "Programs/UnrealHeaderTool/Public"
			}
			);
				
		
		PrivateIncludePaths.AddRange(
			new string[] {
				// ... add other private include paths required here ...
			}
			);
			
		
		PublicDependencyModuleNames.AddRange(
			new string[]
			{
				"Core",
				// ... add other public dependencies that you statically link with here ...
			}
			);
			
		
		PrivateDependencyModuleNames.AddRange(
			new string[]
			{
				"CoreUObject",
				"UMG",
				"Engine",
				"Slate",
				"SlateCore",
				"InputCore",
				"Projects",
				"DeveloperSettings",
				"JsEnv",
				"SpinePlugin",
				"Rive",
				"HTTP",
				"Json",
				"JsonUtilities",
				"JsonSerialization",
				"ProceduralMeshComponent",
				"Puerts",
				"Projects"
				// ... add private dependencies that you statically link with here ...	
			}
			);
		
		
		DynamicallyLoadedModuleNames.AddRange(
			new string[]
			{
				// ... add any modules that your module loads dynamically here ...
			}
			);
	}
}
