from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import time

def login_linkedin(driver, username, password):
    # Go to LinkedIn's login page.
    driver.get('https://www.linkedin.com/login')

    # Enter login details.
    username_input = driver.find_element_by_xpath('//*[@id="username"]')
    username_input.send_keys(username)

    password_input = driver.find_element_by_xpath('//*[@id="password"]')
    password_input.send_keys(password)

    # Click the 'Sign in' button.
    sign_in_button = driver.find_element_by_xpath('//*[@type="submit"]')
    sign_in_button.click()

def navigate_to_jobs(driver):
    # Go to the 'Jobs' page.
    driver.get('https://www.linkedin.com/jobs/')

# Replace with your actual LinkedIn username and password.
username = 'rgao002.application@gmail.com'
password = 'raul0410'

driver = webdriver.Edge()  # Use Microsoft Edge WebDriver

login_linkedin(driver, username, password)
time.sleep(3)  # Wait for the page to load.
navigate_to_jobs(driver)
