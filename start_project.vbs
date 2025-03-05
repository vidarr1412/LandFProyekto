Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\Admin\Videos\FIRIwithCam\caps"
WshShell.Run "cmd /c npm start", 0, False
WshShell.Run "cmd /c node server.js", 0, False
