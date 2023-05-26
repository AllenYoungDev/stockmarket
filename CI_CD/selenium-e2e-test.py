#!/usr/bin/env python3

import sys
import os

import multiprocessing
import subprocess
import time
import psutil

import platform

#import requests

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains

class enabled_elements(object):
  """An expectation for checking that element is enabled.

  locator - used to find the element
  returns the enabled WebElement
  """
  def __init__(self, locator):
    self.locator = locator

  def __call__(self, driver):
    elements = driver.find_elements(*self.locator)   # Finding the referenced elements
    for element in elements:
        if not element.is_enabled():
            return False
    return elements

class Allen_Young_Stockmarket_Selenium_E2e_Tester: #tag:  aysset
    def __init__(self):
        self._backendServerExecutionCommand = 'set DEBUG=* & node server.js true true'
        self._backendServerProgramDirectoryFullPath = ''

        self._frontendServerExecutionCommand = 'http-server -p 80'
        self._frontendServerProgramDirectoryFullPath = ''

        self._launchServers = False

        self._backendServerSubprocess = ''
        self._frontendServerSubprocess = ''

        self._backendServerProcess = ''
        self._frontendServerProcess = ''

        self._websiteFrontendUrl = "http://localhost"
        self._loginWebpageUrl = "http://localhost/login.html"
        self._userAccountWebpageUrl = "http://localhost/account.html"

        self._webBrowserWebdriver = None

        self._userEmailAddress = 'AllenYoung@AllenYoung.dev'
        self._databaseFileFullName = 'allen_young_stockmarket.db'

        self._testCardNumber = '4111111111111111'
        self._testCardExpirationDate = '1225'
        self._testCardCvv = '123'
        self._testCardName = 'John Doe'
        self._testCardCountryCode = 'US'

        self._emailAddressVerificationStatusUpdateCliCommandWindows = 'sqlite3 "' + os.path.join( \
            self._backendServerProgramDirectoryFullPath, self._databaseFileFullName) + \
            '" "UPDATE users SET ""Email address verified"" = \'true\' WHERE ""Email address"" = \'{}\';"'.format(self._userEmailAddress)
        self._emailAddressVerificationStatusUpdateCliCommandLinux = "sqlite3 \"" + os.path.join( \
            self._backendServerProgramDirectoryFullPath, self._databaseFileFullName) + \
            "\" \"UPDATE users SET \\\"Email address verified\\\" = 'true' WHERE \\\"Email address\\\" = '{}';\"".format(self._userEmailAddress)
        
    def _StartTestWebServerProcesses(self):
        #######################################################################
        #Backend server start (by CLI command execution in code in a separate 
        #process, wait until server runs by checking stdout)
        #######################################################################
        self._backendServerProcess = multiprocessing.Process(target=_LaunchBackendServer, 
            args=(self._backendServerExecutionCommand, self._backendServerProgramDirectoryFullPath))
        self._backendServerProcess.start()


        #######################################################################
        #Frontend server start (by CLI command execution in code in a separate 
        #process, wait until server runs by checking stdout)
        #######################################################################
        self._frontendServerProcess = multiprocessing.Process(target=_LaunchFrontendServer, 
            args=(self._frontendServerExecutionCommand, self._frontendServerProgramDirectoryFullPath))
        self._frontendServerProcess.start()        

    def _QuitWebBrowserAndKillServerProcesses(self):
        self._webBrowserWebdriver.quit()
        #time.sleep(20)

        if not self._launchServers:
            return

        serverProcesses = []
        current_process = psutil.Process()

        print('Before frontend and backend servers termination.')  
        children = current_process.children(recursive=True)
        for child in children:
            print('Child pid is {}; child exe is {}; child name is {};'.format(child.pid, child.exe(), child.name()))
            if child.name() == 'node.exe':
                serverProcesses.append(child)

        self._backendServerProcess.terminate()
        #time.sleep(20)
        #self._backendServerProcess.kill()
        #time.sleep(1)
        self._backendServerProcess.join()
        print("self._backendServerProcess.is_alive():  " + str(self._backendServerProcess.is_alive()))
        self._backendServerProcess.close()

        self._frontendServerProcess.terminate()
        #time.sleep(20)
        #self._frontendServerProcess.kill()
        #time.sleep(1)
        self._frontendServerProcess.join()
        print("self._frontendServerProcess.is_alive():  " + str(self._frontendServerProcess.is_alive()))
        self._frontendServerProcess.close()

        #requests.get(self._websiteFrontendUrl) #This is done to kill the frontend server that's still running.
            #Well, this doesn't work!
        #time.sleep(5)

        time.sleep(15)
        print('After frontend and backend servers termination.')  
        children = current_process.children(recursive=True)
        for child in children:
            print('Child pid is {}'.format(child.pid))

        for serverProcess in serverProcesses:
            if serverProcess.is_running():
                print('Child process pid {}, exe {}, name {}, is still running.  Calling terminate() on the process via psutil.'.format(child.pid, child.exe(), child.name()))
                serverProcess.terminate()

    def ExecuteAllenYoungStockmarketSeleniumE2eTest(self, backendServerProgramDirectoryFullPath, 
        frontendServerProgramDirectoryFullPath, launchServers):

        self._backendServerProgramDirectoryFullPath = backendServerProgramDirectoryFullPath
        self._frontendServerProgramDirectoryFullPath = frontendServerProgramDirectoryFullPath
        self._launchServers = launchServers

        self._emailAddressVerificationStatusUpdateCliCommandWindows = 'sqlite3 "' + os.path.join( \
            self._backendServerProgramDirectoryFullPath, self._databaseFileFullName) + \
            '" "UPDATE users SET ""Email address verified"" = \'true\' WHERE ""Email address"" = \'{}\';"'.format(self._userEmailAddress)
        self._emailAddressVerificationStatusUpdateCliCommandLinux = "sqlite3 \"" + os.path.join( \
            self._backendServerProgramDirectoryFullPath, self._databaseFileFullName) + \
            "\" \"UPDATE users SET \\\"Email address verified\\\" = 'true' WHERE \\\"Email address\\\" = '{}';\"".format(self._userEmailAddress)

        print(self._emailAddressVerificationStatusUpdateCliCommandWindows)
        print(self._emailAddressVerificationStatusUpdateCliCommandLinux)

        print('Python version info')
        print(sys.version_info)

        if self._launchServers:
            self._StartTestWebServerProcesses()

        time.sleep(50)

        #######################################################################
        #Launch a Google Chrome web browser instance via Selenium
        #######################################################################

        self._webBrowserWebdriver = webdriver.Chrome()

        self._webBrowserWebdriver.maximize_window()

        #######################################################################
        #Homepage visit
        #######################################################################

        try:
            self._webBrowserWebdriver.get(self._websiteFrontendUrl)
        except Exception as exc:
            print(exc)
            self._QuitWebBrowserAndKillServerProcesses()
            print('Homepage visit failure at start.')
            sys.exit(1)     
    

        #######################################################################
        #Registration link click
        #######################################################################

        try:
            webelementFound = WebDriverWait(self._webBrowserWebdriver, 30).until(
                EC.presence_of_element_located((By.LINK_TEXT, "Register")))
        except Exception as exc:
            print(exc)
            self._QuitWebBrowserAndKillServerProcesses()
            print("Homepage 'Register' link text finding failure.")
            sys.exit(1) 
        webelementFound.click()

        #######################################################################
        #Account creation
        #######################################################################

        #Wait until the page loads
        try:
            webelementFound = WebDriverWait(self._webBrowserWebdriver, 30).until(
                EC.presence_of_element_located((By.NAME, "firstname")))
        except Exception as exc:
            print(exc)
            self._QuitWebBrowserAndKillServerProcesses()
            print("Registration page 'First name' input field finding failure.")
            sys.exit(1) 

        #Find the input fields
        webelement_listFound = \
            self._webBrowserWebdriver.find_elements(By.TAG_NAME, "input")
        if len(webelement_listFound) == 0:
            print("Registration page input fields finding failure.")
            sys.exit(1)

        #Enter the registration info and click the Register button
        webelement_listFound[0].send_keys('Allen')
        webelement_listFound[1].send_keys('Young')
        webelement_listFound[2].send_keys(self._userEmailAddress)
        webelement_listFound[3].send_keys('111-111-1111')
        webelement_listFound[4].send_keys('12345abcde!')
        webelement_listFound[5].send_keys('12345abcde!')
        webelement_listFound[6].click()

        #Wait until the next page loads
        try:
            webelementFound = WebDriverWait(self._webBrowserWebdriver, 60).until(
                EC.presence_of_element_located((By.CLASS_NAME, "email-verification-controls-section-heading")))
        except Exception as exc:
            print(exc)
            self._QuitWebBrowserAndKillServerProcesses()
            print("'Verify Your Email Address' heading finding failure.")
            sys.exit(1)

        ########################################################################
        #Email-address verification status update database CLI command execution
        ########################################################################
        if platform.system() == 'Windows':
            os.system(self._emailAddressVerificationStatusUpdateCliCommandWindows)
        else:  #Linux or Mac
            os.system(self._emailAddressVerificationStatusUpdateCliCommandLinux)

        time.sleep(20) #Wait until the database updates.

        #######################################################################
        #Log in, login verification on home page
        #######################################################################

        try:
            self._webBrowserWebdriver.get(self._loginWebpageUrl)
        except Exception as exc:
            print(exc)
            self._QuitWebBrowserAndKillServerProcesses()
            print('Login page visit failure.')
            sys.exit(1)

        #Wait until the page loads
        try:
            webelementFound = WebDriverWait(self._webBrowserWebdriver, 30).until(
                EC.presence_of_element_located((By.CLASS_NAME, "login-controls-section-heading")))
        except Exception as exc:
            print(exc)
            self._QuitWebBrowserAndKillServerProcesses()
            print("'Login' heading finding failure.")
            sys.exit(1)

        #Find the input fields
        webelement_listFound = \
            self._webBrowserWebdriver.find_elements(By.TAG_NAME, "input")
        if len(webelement_listFound) == 0:
            print("Login page input fields finding failure.")
            sys.exit(1)

        #Enter the login info and click the Login button
        webelement_listFound[0].send_keys(self._userEmailAddress)
        webelement_listFound[1].send_keys('12345abcde!')
        webelement_listFound[2].click()


        #######################################################################
        #Stock purchase, receipt verification
        #######################################################################

        #Wait until the homepage loads
        try:
            webelementFound = WebDriverWait(self._webBrowserWebdriver, 30).until(
                EC.presence_of_element_located((By.LINK_TEXT, "Logout")))
        except Exception as exc:
            print(exc)
            self._QuitWebBrowserAndKillServerProcesses()
            print("Logged-in homepage 'Logout' link text finding failure.")
            sys.exit(1)

        #Wait until the 'number of shares to buy' input field becomes enabled
        try:
            webelement_listFound = WebDriverWait(self._webBrowserWebdriver, 30).until(
                enabled_elements((By.TAG_NAME, "input")))
        except Exception as exc:
            print(exc)
            self._QuitWebBrowserAndKillServerProcesses()
            print("The 'number of shares to buy' input field not enabled.")
            sys.exit(1)

        #Enter the number of shares to buy and click the 'Proceed to checkout' button
        webelement_listFound[0].send_keys('1')
        webelement_listFound[1].click()

        #Wait until the checkout page loads
        try:
            webelementPaypalButtonContainer = WebDriverWait(self._webBrowserWebdriver, 30).until(
                EC.presence_of_element_located((By.ID, "paypal-button-container")))
        except Exception as exc:
            print(exc)
            self._QuitWebBrowserAndKillServerProcesses()
            print("Checkout page Paypal button container finding failure.")
            sys.exit(1)

        try:
            webelementPaypalCardContainer = WebDriverWait(self._webBrowserWebdriver, 30).until(
                EC.presence_of_element_located((By.CLASS_NAME, "card_container")))
        except Exception as exc:
            print(exc)
            self._QuitWebBrowserAndKillServerProcesses()
            print("Checkout page Paypal button container finding failure.")
            sys.exit(1)

        #Find the card number input elements
        try:
            webelementFound1 = webelementPaypalCardContainer.find_element(By.ID, "card-number")
            webelementFound2 = webelementPaypalCardContainer.find_element(By.ID, "braintree-hosted-field-number")
        except Exception as exc:
            print(exc)
            self._QuitWebBrowserAndKillServerProcesses()
            print("Checkout page card number input field finding failure.")
            sys.exit(1)
        webelementFound1.click()
        webelementFound2.send_keys(self._testCardNumber)
        webelementFound1.click()
        webelementFound2.send_keys(self._testCardNumber)
        #For some reason, clicking and sending keys needs to be done twice, not just once.

        #Find the card expiration date input elements
        try:
            webelementFound1 = webelementPaypalCardContainer.find_element(By.ID, "expiration-date")
            webelementFound2 = webelementPaypalCardContainer.find_element(By.ID, "braintree-hosted-field-expirationDate")
        except Exception as exc:
            print(exc)
            self._QuitWebBrowserAndKillServerProcesses()
            print("Checkout page card expiration-date input field finding failure.")
            sys.exit(1)
        webelementFound1.click()
        webelementFound2.send_keys(self._testCardExpirationDate)        
        webelementFound1.click()
        webelementFound2.send_keys(self._testCardExpirationDate)  
        #For some reason, clicking and sending keys needs to be done twice, not just once.
        
        #Find the card CVV input elements
        try:
            webelementFound1 = webelementPaypalCardContainer.find_element(By.ID, "cvv")
            webelementFound2 = webelementPaypalCardContainer.find_element(By.ID, "braintree-hosted-field-cvv")
        except Exception as exc:
            print(exc)
            self._QuitWebBrowserAndKillServerProcesses()
            print("Checkout page card expiration-date input field finding failure.")
            sys.exit(1)
        webelementFound1.click()
        webelementFound2.send_keys(self._testCardCvv) 
        webelementFound1.click()
        webelementFound2.send_keys(self._testCardCvv)  
        #For some reason, clicking and sending keys needs to be done twice, not just once.

        try:
            webelementFound1 = webelementPaypalCardContainer.find_element(By.ID, "card-holder-name")
        except Exception as exc:
            print(exc)
            self._QuitWebBrowserAndKillServerProcesses()
            print("Checkout page card expiration-date input field finding failure.")
            sys.exit(1)
        actions = ActionChains(self._webBrowserWebdriver)
        actions.move_to_element(webelementFound1).perform()
        webelementFound1.click()
        webelementFound1.send_keys(self._testCardName)
         
        #Find the card country code input element
        try:
            webelementFound1 = webelementPaypalCardContainer.find_element(By.ID, "card-billing-address-country")
        except Exception as exc:
            print(exc)
            self._QuitWebBrowserAndKillServerProcesses()
            print("Checkout page card expiration-date input field finding failure.")
            sys.exit(1)
        actions = ActionChains(self._webBrowserWebdriver)
        actions.move_to_element(webelementFound1).perform()            
        webelementFound1.click()
        webelementFound1.send_keys(self._testCardCountryCode)

        #Find the card submit button element
        try:
            webelementFound1 = webelementPaypalCardContainer.find_element(By.ID, "submit")
        except Exception as exc:
            print(exc)
            self._QuitWebBrowserAndKillServerProcesses()
            print("Checkout page card expiration-date input field finding failure.")
            sys.exit(1)
        actions = ActionChains(self._webBrowserWebdriver)
        actions.move_to_element(webelementFound1).perform()            
        webelementFound1.click()

        try:
            webelementFound = WebDriverWait(self._webBrowserWebdriver, 60).until(
                EC.presence_of_element_located((By.ID, "receipt-heading")))
        except Exception as exc:
            print(exc)
            self._QuitWebBrowserAndKillServerProcesses()
            print("No receipt page after checkout submission.")
            sys.exit(1)


        #######################################################################
        #User account page visit and verification
        #######################################################################
        try:
            self._webBrowserWebdriver.get(self._userAccountWebpageUrl)
        except Exception as exc:
            print(exc)
            self._QuitWebBrowserAndKillServerProcesses()
            print('User account page visit failure.')
            sys.exit(1)     

        try:
            webelementFound = WebDriverWait(self._webBrowserWebdriver, 60).until(
                EC.presence_of_element_located((By.XPATH, "/html/body/div/section[2]/div/table/tbody/tr")))
        except Exception as exc:
            print(exc)
            self._QuitWebBrowserAndKillServerProcesses()
            print("User account page rendering failure.")
            sys.exit(1)

        #######################################################################
        #Homepage visit
        #######################################################################
        try:
            self._webBrowserWebdriver.get(self._websiteFrontendUrl)
        except Exception as exc:
            print(exc)
            self._QuitWebBrowserAndKillServerProcesses()
            print('Homepage visit failure toward the end.')
            sys.exit(1)   

        #######################################################################
        #Log out and homepage update verification
        #######################################################################

        try:
            webelementFound = WebDriverWait(self._webBrowserWebdriver, 30).until(
                EC.presence_of_element_located((By.LINK_TEXT, "Logout")))
        except Exception as exc:
            print(exc)
            self._QuitWebBrowserAndKillServerProcesses()
            print("Homepage 'Logout' link text finding failure.")
            sys.exit(1) 
        webelementFound.click()

        try:
            webelementFound = WebDriverWait(self._webBrowserWebdriver, 30).until(
                EC.presence_of_element_located((By.LINK_TEXT, "Register")))
        except Exception as exc:
            print(exc)
            self._QuitWebBrowserAndKillServerProcesses()
            print("Homepage 'Register' link text finding failure after logout.")
            sys.exit(1) 


        #######################################################################
        #Exit Google Chrome web browser instance via Selenium
        #and kill the server processes
        #######################################################################        
        self._QuitWebBrowserAndKillServerProcesses()

        print('Testing success!')
        sys.exit(0)

def _LaunchBackendServer(backendServerExecutionCommand, backendServerProgramDirectoryFullPath):
    backendServerSubprocess = subprocess.run(backendServerExecutionCommand, 
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, encoding='utf-8', errors='utf-8', 
        cwd=backendServerProgramDirectoryFullPath, shell=True)
            
    return

    with open('tempLog-backend{0}.log'.format(os.getpid()),'w+') as f:
        self._backendServerSubprocess = subprocess.run(self._backendServerExecutionCommand, 
            stdout=f, stderr=f, encoding='utf-8', errors='utf-8', 
            cwd=self._backendServerProgramDirectoryFullPath, shell=True)

def _LaunchFrontendServer(frontendServerExecutionCommand, frontendServerProgramDirectoryFullPath):
    frontendServerSubprocess = subprocess.run(frontendServerExecutionCommand, 
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, encoding='utf-8', errors='utf-8', 
        cwd=frontendServerProgramDirectoryFullPath, shell=True)

    return
    with open('tempLog-frontend{0}.log'.format(os.getpid()),'w+') as f:
        self._frontendServerSubprocess = subprocess.run(self._frontendServerExecutionCommand, 
            stdout=f, stderr=f, encoding='utf-8', errors='utf-8', 
            cwd=self._frontendServerProgramDirectoryFullPath, shell=True)

    



if __name__ == '__main__':      
    if len(sys.argv) < 3:
        sys.exit('At least two arguments required.  backendServerProgramDirectoryFullPath and frontendServerProgramDirectoryFullPath; launchServers is optional.')
        
    backendServerProgramDirectoryFullPath = sys.argv[1]
    frontendServerProgramDirectoryFullPath = sys.argv[2]   

    launchServers = False
    if len(sys.argv) >= 4: 
        launchServers = True if sys.argv[3].lower() == 'true' else False

    print('backendServerProgramDirectoryFullPath:  ' + backendServerProgramDirectoryFullPath) 
    print('frontendServerProgramDirectoryFullPath:  ' + frontendServerProgramDirectoryFullPath) 
    
    aysset = Allen_Young_Stockmarket_Selenium_E2e_Tester()
    aysset.ExecuteAllenYoungStockmarketSeleniumE2eTest(backendServerProgramDirectoryFullPath, 
        frontendServerProgramDirectoryFullPath, launchServers)