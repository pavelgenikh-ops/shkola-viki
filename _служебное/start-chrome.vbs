' Shkola Viki: starts a local web server (needed for the neural voice) and opens the app in Chrome.
Option Explicit
Dim sh, fso, root, py, url, port, chrome
Set sh = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

root = fso.GetParentFolderName(fso.GetParentFolderName(WScript.ScriptFullName))
port = "8128"
url = "http://127.0.0.1:" & port & "/index.html"
py = "C:\Program Files\LibreOffice\program\python.exe"

If fso.FileExists(py) Then
  sh.Run """" & py & """ -m http.server " & port & " --bind 127.0.0.1 --directory """ & root & """", 0, False
  WScript.Sleep 1400
Else
  url = "file:///" & Replace(root & "\index.html", "\", "/")
End If

chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
If fso.FileExists(chrome) Then
  sh.Run """" & chrome & """ --start-maximized --app=" & url, 1, False
Else
  sh.Run url, 1, False
End If
