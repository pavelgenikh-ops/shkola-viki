' Shkola Viki launcher: starts a tiny local web server (needed for the neural voice)
' and opens the app in Edge (or Chrome). No console window appears.
Option Explicit
Dim sh, fso, root, py, url, port, edge, edge2, chrome
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

edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
edge2 = "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"

If fso.FileExists(edge) Then
  sh.Run """" & edge & """ --start-maximized --app=" & url, 1, False
ElseIf fso.FileExists(edge2) Then
  sh.Run """" & edge2 & """ --start-maximized --app=" & url, 1, False
ElseIf fso.FileExists(chrome) Then
  sh.Run """" & chrome & """ --start-maximized --app=" & url, 1, False
Else
  sh.Run url, 1, False
End If
