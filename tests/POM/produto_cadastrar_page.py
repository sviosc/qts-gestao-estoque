from selenium.webdriver.common.by import By

class produto_cadastrar:
    def __init__(self, driver):
        self.driver = driver
        
    def preencher_nome(self, nomeProduto):
        self.driver.find_element(By.ID, 'nomeProduto').send_keys(nomeProduto)
        
    def preencher_marca(self, marcaProduto):
        self.driver.find_element(By.ID, 'marcaProduto').send_keys(marcaProduto)       
        
    def preencher_precoCusto(self, precoCusto):
        self.driver.find_element(By.ID, 'precoCusto').send_keys(precoCusto)  
        
    def preencher_precoVenda(self, precoVenda):
        self.driver.find_element(By.ID, 'precoVenda').send_keys(precoVenda)  

    def clicar_salvar(self):
        self.driver.find_element(By.ID, 'salvar').click()