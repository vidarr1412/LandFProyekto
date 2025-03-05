Set UAC = CreateObject("Shell.Application") 
UAC.ShellExecute "wscript.exe", """C:\Users\Admin\Videos\FIRIwithCam\caps\run_script.vbs""", "", "runas", 0
