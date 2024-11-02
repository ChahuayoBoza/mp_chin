import request from 'request';
import keys from '../data/keys.js';
import order from '../data/order.js';
import crypto from 'crypto-js';

const { hmacSHA256 } = crypto;
const { Hex } = crypto.enc;

const endpoint = keys.endpoint;         // SERVIDOR
const username = keys.username;         // USUARIO
const password = keys.password;         // CONTRASEÑA API REST
const publickey = keys.publickey;       // PUBLIC KEY

//SE GENERA EL TOKEN DE AUTENTICACIÓN ==============================================//
const auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');    // AUTENTICACION

//API ========================================================================//

export const apiCheckout = (req, res, next) => {
  var jsonOrder = {
    "amount": req.body.paymentConf.amount,
    "currency": req.body.paymentConf.currency,
    "orderId": "orderRandomOrderId",
    "customer": {
        "email": "izipay@example.com"
    },
  };
  request.post({
    url: `${endpoint}/api-payment/V4/Charge/CreatePayment`,
    headers: {
      'Authorization': auth,
      'Content-Type': 'application/json'
    },
    json: jsonOrder
  }, 
  function(error, response, body) {
    if (body.status === 'SUCCESS') {
      const formtoken = body.answer.formToken;
      res.send({ formtoken, publickey, endpoint });
    } else {
      console.error(body);
      res.status(500).send('error');
    }  
  });
};

export const apiValidate = (req, res, next) => {
  const answer = JSON.parse(req.body["rawClientAnswer"]);
  const hash = req.body["hash"];

  const answerHash = crypto.enc.Hex.stringify(
    crypto.HmacSHA256(JSON.stringify(answer), keys.HMACSHA256)
  );
  const orderDetails = answer.orderDetails;

  if (hash === answerHash) {
    res.status(200).send({ 'response': answer.orderStatus, 'details': orderDetails });
  } else {
    res.status(500).send({ 'response': 'Error catastrófico' });
  }
};

export const ipn = (req, res) => {
  const answer = JSON.parse(req.body["kr-answer"]);
  const hash = req.body["kr-hash"];

  const answerHash = crypto.enc.Hex.stringify(
   crypto.HmacSHA256(JSON.stringify(answer), 'testpassword_nLE8XGvREbCMok9QponURxVBj90MNOcbROHci2lTuIQXc')
  );
  console.log(answerHash);
  console.log(hash);

  if (hash === answerHash) {// aqui poner logica para guardar en base de datos la compra, esto identifica la compra realizada
    res.status(200).send({ 'response': answer.orderStatus });
  } else {
    res.status(500).send({ 'response': 'Error catastrófico, puede estar teniendo un intento de fraude' });
  }
};

export const formToken = (req, res, next) => {
  const order = req.body;

  var jsonOrder = {
    "amount": order["amount"],
    "currency": order["currency"],
    "orderId": order["orderId"],
    "customer": order["customer"],
  };
  request.post({
    url: `${endpoint}/api-payment/V4/Charge/CreatePayment`,
    headers: {
      'Authorization': auth,
      'Content-Type': 'application/json'
    },
    json: jsonOrder
  }, 
  function(error, response, body) {
    if (body.status === 'SUCCESS') {
      const formtoken = body.answer.formToken;
      res.send(formtoken);
    } else {
      console.error(body);
      res.status(500).send('error');
    }  
  });
};
