Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\Admin\Videos\FIRIwithCam\caps"

' Run npm start in the background
WshShell.Run "cmd /c npm start", 0, False

' Run server.js in the background
WshShell.Run "cmd /c node server.js", 0, False

' Wait for the server to start (adjust time if needed)
WScript.Sleep 5000

' Open Chrome with localhost:3000
WshShell.Run """C:\Program Files\Google\Chrome\Application\chrome.exe"" http://localhost:3000", 1, False
