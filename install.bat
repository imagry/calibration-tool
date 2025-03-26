@echo off
echo Checking if curl is installed...
curl --version >nul 2>&1
if %errorlevel% neq 0 (
    echo curl is not installed. Please install curl and try again.
    exit /b 1
)
echo Checking operating system...
ver | findstr /i "Windows" >nul 2>&1
if %errorlevel% equ 0 (
    echo Detected Windows.
    echo Checking if Node.js is installed...
    node -v >nul 2>&1
    if %errorlevel% neq 0 (
        echo Node.js is not installed. Installing Node.js...
        curl -o node-setup.msi https://nodejs.org/dist/v18.0.0/node-v18.0.0-x64.msi
        start /wait msiexec /i node-setup.msi /quiet /norestart
        del node-setup.msi
    )
    node -v | findstr /r "^v18" >nul 2>&1
    if %errorlevel% neq 0 (
        echo Node.js version is not 18 or higher. Please update Node.js manually.
        exit /b 1
    )
) else (
    echo Detected non-Windows system. Checking if Ubuntu...
    lsb_release -a 2>/dev/null | grep -i "Ubuntu" >nul 2>&1
    if %errorlevel% neq 0 (
        echo Unsupported operating system. Please use Windows or Ubuntu.
        exit /b 1
    )
    echo Detected Ubuntu.
    echo Checking if Node.js is installed...
    node -v > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo Node.js is not installed. Installing Node.js...
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    node -v | grep -E "^v18" > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo Node.js version is not 18 or higher. Please update Node.js manually.
        exit 1
    fi
)
echo Node.js >=18 is installed and meets the version requirement.
echo Installing global npm packages: react-scripts, typescript, and ts-node...
npm install -g react-scripts typescript ts-node
if %errorlevel% neq 0 (
    echo Failed to install global npm packages. Please check your npm configuration.
    exit /b 1
)
npm install
