import React from 'react';

const PoliticaPrivacidade = () => {
    return (
        <div className="page-container policy-container">
            <div className="policy-card">
                
                <h1 className="page-title" style={{ marginBottom: '10px' }}>Política de Privacidade</h1>
                <p className="policy-date">
                    Última atualização: 23 de março de 2026
                </p>

                <div className="policy-content">
                    <p>A sua privacidade é importante para nós. Esta Política de Privacidade explica como a <strong>Acesso Imagens</strong> recolhe, usa e protege as suas informações pessoais quando utiliza o nosso site.</p>

                    <h2 className="policy-subtitle">1. Informações que Recolhemos</h2>
                    <ul>
                        <li><strong>Dados de Cadastro:</strong> Nome completo, endereço de e-mail e senha.</li>
                        <li><strong>Login Social (Google e Facebook):</strong> Se optar por criar conta usando o Google ou Facebook, receberemos apenas o seu nome público e endereço de e-mail fornecidos por essas plataformas. Não temos acesso às suas senhas das redes sociais.</li>
                        <li><strong>Dados de Pagamento:</strong> Quando faz uma compra, os dados do seu cartão ou PIX são processados diretamente pela plataforma de pagamento segura. Nós não armazenamos os dados do seu cartão nos nossos servidores.</li>
                    </ul>

                    <h2 className="policy-subtitle">2. Como Usamos as suas Informações</h2>
                    <p>Utilizamos as suas informações exclusivamente para criar e gerir a sua conta, processar os seus pedidos, liberar o acesso às fotos/vídeos comprados e enviar atualizações sobre as suas compras.</p>

                    <h2 className="policy-subtitle">3. Compartilhamento de Dados</h2>
                    <p>A Acesso Imagens não vende, aluga ou compartilha os seus dados pessoais com terceiros para fins de marketing. Compartilhamos dados apenas com o Mercado Pago Instituição de Pagamento Ltda para concluir a sua compra.</p>

                    <h2 className="policy-subtitle">4. Exclusão de Dados</h2>
                    <p>Você tem o direito de solicitar a exclusão total dos seus dados pessoais dos nossos servidores a qualquer momento. Para solicitar a exclusão da sua conta e de todos os dados associados, basta enviar um e-mail para: <strong>acessoimagens.am@gmail.com</strong>.</p>

                    <h2 className="policy-subtitle">5. Contato</h2>
                    <p>Se tiver alguma dúvida sobre esta Política de Privacidade, por favor, contate-nos através do e-mail informado acima.</p>
                </div>
            </div>
        </div>
    );
};

export default PoliticaPrivacidade;