#pragma once

class REACTORUMG_API FReactorUtils
{
public:
	/**
	 * Recursively copy all files and subdirectories under SrcDir to DestDir,
	 * and check if the files exist based on SkipExistFiles. If they exist, skip copy overwrite
	 * @param SrcDir Copy source directory
	 * @param DestDir destination directory
	 * @param SkipExistFiles Skip copied files when they exist,
	 *						the content is the relative path to SrcDir which can be without a suffix
	 * @return 
	 */
	static bool CopyDirectoryRecursive(const FString& SrcDir, const FString& DestDir, const TArray<FString>& SkipExistFiles = {});

	static void CopyFile(const FString& SrcFile, const FString& DestFile);

	static void DeleteFile(const FString& FilePath);

	static FString GetPluginContentDir();
	
	static FString GetPluginDir();

	static bool DeleteDirectoryRecursive(const FString& DirPath);

	static bool CreateDirectoryRecursive(const FString& DirPath);

	FORCEINLINE static bool CopyDirectoryTree(const FString& Src, const FString& Dest, bool Overrided)
	{
		IPlatformFile& PlatformFile = FPlatformFileManager::Get().GetPlatformFile();
		return PlatformFile.CopyDirectoryTree(*Dest, *Src, Overrided);
	}

	static FString GetTypeScriptHomeDir();

	static bool CheckNameExistInArray(const TArray<FString>& SkipExistFiles, const FString& CheckName);

	static bool ReadFileContent(const FString& FilePath, FString& OutContent);

	static FString ConvertRelativePathToFullUsingTSConfig(const FString& RelativePath, const FString& DirName);
	
	static FString GetTSCBuildOutDirFromTSConfig(const FString& ProjectDir);

	static FString GetGamePlayTSHomeDir();

	static FString GetGamePlayStartPoint();

	static bool IsAnyPIERunning();
};
