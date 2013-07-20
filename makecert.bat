openssl req -new -subj "/CN=%1" -key cakey.pem -out %1-req.pem
openssl x509 -req -days 7305 -CA cacert.crt -CAkey cakey.pem -set_serial %2 -in %1-req.pem -out %1.crt
del %1-req.pem
echo t > %1-test.tmp