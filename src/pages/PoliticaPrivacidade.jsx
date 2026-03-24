import React from 'react';
// Se o seu site usa o Padrão B (explicado acima), descomente a linha abaixo e ajuste o caminho:
// import Navbar from '../components/Navbar'; 

const PoliticaPrivacidade = () => {
    return (
        <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
            {/* Se o seu site usa o Padrão B, descomente a linha abaixo: */}
            {/* <Navbar /> */}

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginTop: '20px' }}>
                
                <h1 style={{ color: '#6c0464', marginBottom: '10px' }}>Política de Privacidade</h1>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '30px' }}>
                    Última atualização: 23 de março de 2026
                </p>

                <div style={{ color: '#333', lineHeight: '1.6' }}>
                    <p>A sua privacidade é importante para nós. Esta Política de Privacidade explica como a <strong>Acesso Imagens</strong> recolhe, usa e protege as suas informações pessoais quando utiliza o nosso site.</p>

                    <h2 style={{ color: '#6c0464', fontSize: '1.2rem', marginTop: '25px' }}>1. Informações que Recolhemos</h2>
                    <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
                        <li><strong>Dados de Cadastro:</strong> Nome completo, endereço de e-mail e senha.</li>
                        <li><strong>Login Social (Google e Facebook):</strong> Se optar por criar conta usando o Google ou Facebook, receberemos apenas o seu nome público e endereço de e-mail fornecidos por essas plataformas. Não temos acesso às suas senhas das redes sociais.</li>
                        <li><strong>Dados de Pagamento:</strong> Quando faz uma compra, os dados do seu cartão ou PIX são processados diretamente pela plataforma de pagamento segura. Nós não armazenamos os dados do seu cartão nos nossos servidores.</li>
                    </ul>

                    <h2 style={{ color: '#6c0464', fontSize: '1.2rem', marginTop: '25px' }}>2. Como Usamos as suas Informações</h2>
                    <p>Utilizamos as suas informações exclusivamente para criar e gerir a sua conta, processar os seus pedidos, liberar o acesso às fotos/vídeos comprados e enviar atualizações sobre as suas compras.</p>

                    <h2 style={{ color: '#6c0464', fontSize: '1.2rem', marginTop: '25px' }}>3. Compartilhamento de Dados</h2>
                    <p>A Acesso Imagens não vende, aluga ou compartilha os seus dados pessoais com terceiros para fins de marketing. Compartilhamos dados apenas com os processadores de pagamento necessários para concluir a sua compra.</p>

                    <h2 style={{ color: '#6c0464', fontSize: '1.2rem', marginTop: '25px' }}>4. Exclusão de Dados</h2>
                    <p>Você tem o direito de solicitar a exclusão total dos seus dados pessoais dos nossos servidores a qualquer momento. Para solicitar a exclusão da sua conta e de todos os dados associados, basta enviar um e-mail para: <strong>contato@acessoimagens.com.br</strong>.</p>

                    <h2 style={{ color: '#6c0464', fontSize: '1.2rem', marginTop: '25px' }}>5. Contato</h2>
                    <p>Se tiver alguma dúvida sobre esta Política de Privacidade, por favor, contate-nos através do e-mail informado acima.</p>
                </div>
            </div>
        </div>
    );
};

export default PoliticaPrivacidade;