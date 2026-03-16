@echo off
setlocal

cd /d "%~dp0"

set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot"

if not exist "%JAVA_HOME%\bin\java.exe" (
    echo Java not found at %JAVA_HOME%
    echo Please update JAVA_HOME inside run-website.bat
    pause
    exit /b 1
)

if not exist "%~dp0apache-maven-3.9.14\bin\mvn.cmd" (
    echo Maven not found at %~dp0apache-maven-3.9.14\bin\mvn.cmd
    echo Please keep the apache-maven-3.9.14 folder in this project directory.
    pause
    exit /b 1
)

echo Starting Banerjee Diagnostic Foundation and Hospaccx website...
echo Open http://localhost:8081 after startup completes.
echo.

call "%~dp0apache-maven-3.9.14\bin\mvn.cmd" -s "%~dp0settings.xml" spring-boot:run

pause
