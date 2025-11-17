Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Get the script's directory (VelocityRealEstate folder)
strScriptPath = WScript.ScriptFullName
strScriptDir = objFSO.GetParentFolderName(strScriptPath)

' Try to find VS Code in common locations
vsPaths = Array( _
    "C:\Program Files\Microsoft VS Code\Code.exe", _
    "C:\Users\Owner\AppData\Local\Programs\Microsoft VS Code\Code.exe", _
    "C:\Program Files (x86)\Microsoft VS Code\Code.exe" _
)

vsCodePath = ""
For Each path In vsPaths
    If objFSO.FileExists(path) Then
        vsCodePath = path
        Exit For
    End If
Next

If vsCodePath <> "" Then
    ' VS Code found - open the project
    MsgBox "Opening VS Code with your project..." & vbCrLf & vbCrLf & _
           "Once VS Code opens:" & vbCrLf & _
           "1. Open 'index.html' from file explorer (left)" & vbCrLf & _
           "2. Press Ctrl+K then V for live preview" & vbCrLf & _
           "3. Edit code and see changes instantly!", _
           vbInformation, "VS Code Opening"

    objShell.Run """" & vsCodePath & """ """ & strScriptDir & """ """ & strScriptDir & "\index.html""", 1, False
Else
    ' VS Code not found - open folder in explorer instead
    result = MsgBox("VS Code not found." & vbCrLf & vbCrLf & _
                    "Would you like to:" & vbCrLf & _
                    "YES = Download VS Code now" & vbCrLf & _
                    "NO = Open project folder instead", _
                    vbYesNo + vbQuestion, "VS Code Not Installed")

    If result = vbYes Then
        objShell.Run "https://code.visualstudio.com/download", 1, False
    Else
        objShell.Run "explorer """ & strScriptDir & """", 1, False
    End If
End If
