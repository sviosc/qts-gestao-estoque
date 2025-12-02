import time

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

from produto_cadastrar_page import produto_cadastrar

def iniciar_driver():
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service)
    return driver

def test_cadastro_valido(driver):
    produto = produto_cadastrar(driver)
    produto.preencher_nome("suco de uva")
    produto.preencher_marca("Del Vale")
    produto.preencher_precoCusto(3)
    produto.preencher_precoVenda(8)
    produto.clicar_salvar()
    time.sleep(1)
    
    try:
        alert = driver.switch_to.alert
        print("Alert exibido:", alert.text)
        alert.accept()
    except:
        print("Nenhum alert encontrado")
    
    assert "produto-listar" in driver.current_url
    print('O teste foi um sucesso.')
    
if __name__ == "__main__":
    
    url = f"http://localhost:3000/produto-cadastrar.html"
    
    driver = iniciar_driver()
    driver.get(url)
    
    try:
        test_cadastro_valido(driver)
    finally:
        time.sleep(2)
        driver.quit()