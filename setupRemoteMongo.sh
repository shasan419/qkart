mongoimport --uri "mongodb+srv://shasan419:dxa88dxa@qkart-node.vvp9ztt.mongodb.net/qkart?retryWrites=true&w=majority" --drop --collection users --file data/export_qkart_users.json
mongoimport --uri "mongodb+srv://shasan419:dxa88dxa@qkart-node.vvp9ztt.mongodb.net/qkart?retryWrites=true&w=majority" --drop --collection products --file data/export_qkart_products.json
