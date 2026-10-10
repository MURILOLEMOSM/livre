/* =========================================================
   LIVRE · configuração
   Cole aqui o firebaseConfig do seu projeto (Firebase console >
   Configurações do projeto > Seus apps > app da Web) e a chave
   pública VAPID. Todos estes valores são PÚBLICOS: podem ficar
   no navegador. A chave privada da conta de serviço e a VAPID
   privada ficam SÓ nas variáveis de ambiente do Netlify.

   Enquanto firebase.apiKey estiver vazio, o app roda em "modo local":
   contas e dados ficam só neste aparelho (bom para testar).
   ========================================================= */

window.LIVRE_CONFIG = {
  firebase: {
    apiKey: 'AIzaSyDfBev42F3SyyQZ4aj6yskVj73zC6NxV34',
    authDomain: 'livre-c7d31.firebaseapp.com',
    projectId: 'livre-c7d31',
    storageBucket: 'livre-c7d31.firebasestorage.app',
    messagingSenderId: '583323951222',
    appId: '1:583323951222:web:357387fef538d77bc6bf57',
  },
  vapidPublicKey: 'BO1fQuLqA83lcEsztQ3HYjJt439a08xtGemYnGaDdHdtYzMjLIB2bJM-aqAzCQ-boBB6mw_NB_or4AVSvI2Xw-0',   // a mesma VAPID_PUBLIC_KEY do Netlify
};
