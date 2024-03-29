/**
 * Module dependencies.
 */
var secrets = require('../../config/secrets');
var Promise = require('promise');
var request = require('superagent');


/**
 * Natural Language Processing Training
 */
var natural = require('natural'),
  tokenizer = new natural.WordTokenizer(),
  classifier = new natural.BayesClassifier();

// Casual Talk
classifier.addDocument('Hey there', 'casual');
classifier.addDocument('Hi there', 'casual');
classifier.addDocument('Hi the squirrel', 'casual');
classifier.addDocument('Hiya brother', 'casual');
classifier.addDocument('hey hey heyo', 'casual');
classifier.addDocument('yo', 'casual');
classifier.addDocument('Gimme the love', 'casual');
classifier.addDocument('Who are you', 'casual');
classifier.addDocument('Who is this', 'casual');
classifier.addDocument('Name yourself', 'casual');

// Incoherent Speak
classifier.addDocument('Uncontrollable', 'incoherent');
classifier.addDocument('Speaking easy', 'incoherent');
classifier.addDocument('Backpack time', 'incoherent');
classifier.addDocument('Moon shine sight', 'incoherent');
classifier.addDocument('Scared of nothing, can\'t control', 'incoherent');
classifier.addDocument('Gotta love the yum yum', 'incoherent');

// Casual Responsive Talk
classifier.addDocument('How\'s it going', 'supercasual');
classifier.addDocument('What\'s up', 'supercasual');
classifier.addDocument('Waddup dawg', 'supercasual');
classifier.addDocument('Holla bro what\'s good in the house', 'supercasual');

// Mean Talk
classifier.addDocument('You suck', 'negative');
classifier.addDocument('This app stinks', 'negative');
classifier.addDocument('I\'m surprised this even works', 'negative');
classifier.addDocument('Worst programmer in the world', 'negative');
classifier.addDocument('This app can die', 'negative');
classifier.addDocument('This app can suck it', 'negative');

// Nuts Talk
classifier.addDocument('What do you think of nuts?', 'nuts');
classifier.addDocument('Nuts are awesome right?', 'nuts');

// Single Stock Picking
classifier.addDocument('Look up this symbol', 'single_stock');
classifier.addDocument('What\'s the price of this symbol', 'single_stock');
classifier.addDocument('How much does this symbol cost?', 'single_stock');
classifier.addDocument('Help me find out more about this symbol', 'single_stock');
classifier.addDocument('Learn more about this symbol', 'single_stock');
classifier.addDocument('Find a certain symbol', 'single_stock');
classifier.addDocument('Look up this symbol', 'single_stock');
classifier.addDocument('Find this symbol', 'single_stock');
classifier.addDocument('Give me info on this symbol', 'single_stock');

// Stock Picking Talk
classifier.addDocument('Stocks', 'stocks');
classifier.addDocument('Give me stock picks', 'stocks');
classifier.addDocument('I need help investing my money', 'stocks');
classifier.addDocument('My stocks right now', 'stocks');
classifier.addDocument('Teach me finance', 'stocks');
classifier.addDocument('Gotta start investing', 'stocks');
classifier.addDocument('Help me invest my money', 'stocks');

// More Urgent Talk
classifier.addDocument('help me', 'urgent');
classifier.addDocument('I need stuff quick', 'urgent');
classifier.addDocument('hey quickly', 'urgent');
classifier.addDocument('this is urgent', 'urgent');

// ATMs Nearby
classifier.addDocument('Show me ATMs near this place', 'atms');
classifier.addDocument('Find ATMs in my area', 'atms');
classifier.addDocument('Find Automated Teller Machines in my area', 'atms');
classifier.addDocument('Find me the ATMs nearby', 'atms');
classifier.addDocument('Find me ATMs around me', 'atms');
classifier.addDocument('Get a list of ATMs around me', 'atms');
classifier.addDocument('Get me all the ATMs around me', 'atms');
classifier.addDocument('Get me all the ATMs nearby', 'atms');
classifier.addDocument('Get ATMs nearby', 'atms');

// Show Bills
classifier.addDocument('Show me bills', 'bills');
classifier.addDocument('Show me my bills', 'bills');
classifier.addDocument('Show my recent bills', 'bills');
classifier.addDocument('Show all bills', 'bills');
classifier.addDocument('Discover my bills', 'bills');
classifier.addDocument('Get my bills', 'bills');
classifier.addDocument('Pull up my bills', 'bills');
classifier.addDocument('Pull up my recent bills', 'bills');

// Show Deposits
classifier.addDocument('Show me deposits', 'deposits');
classifier.addDocument('Show me my deposits', 'deposits');
classifier.addDocument('Show my recent deposits', 'deposits');
classifier.addDocument('Show all deposits', 'deposits');
classifier.addDocument('Discover my deposits', 'deposits');
classifier.addDocument('Get my deposits', 'deposits');
classifier.addDocument('Pull up my deposits', 'deposits');
classifier.addDocument('Pull up my recent deposits', 'deposits');

// Merchants Nearby
classifier.addDocument('Show me merchants near this place', 'merchants');
classifier.addDocument('Find merchants in my area', 'merchants');
classifier.addDocument('Find me the merchants nearby', 'merchants');
classifier.addDocument('Find me merchants around me', 'merchants');
classifier.addDocument('Get a list of merchants around me', 'merchants');
classifier.addDocument('Get me all the merchants around me', 'merchants');
classifier.addDocument('Get me all the merchants nearby', 'merchants');
classifier.addDocument('Get merchants nearby', 'merchants');

// Show Purchases
classifier.addDocument('Show me purchases', 'purchases');
classifier.addDocument('Show me my purchases', 'purchases');
classifier.addDocument('Show my recent purchases', 'purchases');
classifier.addDocument('Show all purchases', 'purchases');
classifier.addDocument('Discover my purchases', 'purchases');
classifier.addDocument('Get my purchases', 'purchases');
classifier.addDocument('Pull up my purchases', 'purchases');
classifier.addDocument('Pull up my recent purchases', 'purchases');

// Show Withdrawals
classifier.addDocument('Show me withdrawals', 'withdrawals');
classifier.addDocument('Show me my withdrawals', 'withdrawals');
classifier.addDocument('Show my recent withdrawals', 'withdrawals');
classifier.addDocument('Show all withdrawals', 'withdrawals');
classifier.addDocument('Discover my withdrawals', 'withdrawals');
classifier.addDocument('Get my withdrawals', 'withdrawals');
classifier.addDocument('Pull up my withdrawals', 'withdrawals');
classifier.addDocument('Pull up my recent withdrawals', 'withdrawals');

// Show Transfers
classifier.addDocument('Show me transfers', 'transfers');
classifier.addDocument('Show me my transfers', 'transfers');
classifier.addDocument('Show my recent transfers', 'transfers');
classifier.addDocument('Show all transfers', 'transfers');
classifier.addDocument('Discover my transfers', 'transfers');
classifier.addDocument('Get my transfers', 'transfers');
classifier.addDocument('Pull up my transfers', 'transfers');
classifier.addDocument('Pull up my recent transfers', 'transfers');

// Finally, Train the Classifier
classifier.train();


/**
 * Function: Parses the query to the Capital One API using dummy text matching, which is really
 * quite rudimentary but will hopefully seem cool. Then returns the response in properly formatted
 * text for whatever the user entered as his or her query.
 */
exports.getCapitalOneResponse = function (query) {
  var baseURL = 'http://api.reimaginebanking.com';
  var API_KEY = '179db383c3f674aec29692d92289ca1b';

  var CUSTOMER_ID = '55e94a6af8d8770528e60cc6';
  var ACCOUNT_ID = '55e94a6cf8d8770528e616e7';
  var savingsAccountID = '55e94a6cf8d8770528e616e6';
  var savingsCustomerID = '55e94a6af8d8770528e60cc5';
  var constantNumStocks = 4;

  // Create a promise that should pass result back down to the server.
  return new Promise(function (resolve, reject) {
    switch (classifier.classify(query)) {

      case 'casual':
        resolve("Hi, I'm the Squirrel and I'm here to help to manage your finances. I'm an expert hoarder (of nuts).");
        break;

      case 'incoherent':
        resolve("I\'m sorry, I didn\'t understand what you just said. Perhaps you could try another query?");
        break;

      case 'supercasual':
        resolve("Someone's excited! Nice to meet you, I'm the Squirrel. Feel free to ask me about your finances.");
        break;

      case 'negative':
        resolve("Please calm down. There's no need to be rude. Let me assist you with your finances.");
        break;

      case 'nuts':
        resolve("Yes, I love my nuts. I was created to assist but only for actual queries.");
        break;

      case 'urgent':
        resolve("It will be okay. I can help you. Please send me one of your financial queries.");
        break;

      case 'stocks':
        var fullURL = baseURL + '/accounts/' + savingsAccountID + "?key=" + API_KEY;
        var responseText = 'You are currently viewing the ';

        request.get(fullURL).end(function(err, res) {
          if (!err) {
            var accountInfo = res.body;
            var accountBalance = accountInfo.balance;
            var stockTotal = 0;
            var stockCounter = 0;
            var randAlloc = Math.floor((Math.random() * 20) + 50);
            var allocAccount = (randAlloc / 100) * accountBalance;

            responseText += (accountInfo.type + ' of ' + accountInfo.nickname + '. Your balance is $' + accountBalance + '. ');
            responseText += ('We recommend holding a ' + randAlloc + '% position in stocks and purchasing ');

            for (var i = 0; i < constantNumStocks; i++) {
              var randCompanyIndex = Math.floor(Math.random() * SP500_COMPANIES.length);
              var randCompany = SP500_COMPANIES[randCompanyIndex];
              var markitAPI = 'http://dev.markitondemand.com/Api/v2/Quote/json?symbol=' + randCompany.Symbol;

              request.get(markitAPI).end(function(err, res) {
                if (!err) {
                  var data = JSON.parse(res.text);
                  var thisAlloc = (0.6 * allocAccount);
                  var quantity = Math.floor(thisAlloc / data.LastPrice);
                  responseText += (quantity + " shares of " + data.Symbol + " at " + data.LastPrice + " and ");
                  stockCounter += 1;

                  if (stockCounter === (constantNumStocks)) {
                    responseText += (" that will bring your stock portfolio to a value of " + stockTotal.toFixed(2));
                    resolve(responseText);
                  }

                  stockTotal += (quantity * data.LastPrice);
                  allocAccount -= (quantity * data.LastPrice);
                }
              });
            }
          }
        });
        break;

      case 'single_stock':
        var symbol = query.match(/(\s)+[A-Z]+/);

        if (symbol == null) {
          var responseText = "Stock lookup failed. Please enter a valid ticket symbol and make sure the ticker is in CAPS."
          resolve(responseText);
          break
        }

        var symbolQuote = symbol[0].trim();
        var markitAPI = 'http://dev.markitondemand.com/Api/v2/Quote/json?symbol=' + symbolQuote;

        request.get(markitAPI).end(function(err, res) {
          var responseText;
          if (!err) {
            var data = JSON.parse(res.text);
            responseText = "Stock lookup successful! " + data.Name + " is currently trading at " + data.LastPrice + ". Last updated at " + data.Timestamp;
            resolve(responseText);
          } else {
            responseText = "Stock lookup failed. Please enter a valid ticket symbol and make sure the ticker is in CAPS."
            resolve(responseText);
          }
        });
        break;

      case 'atms':
        var queryArr = tokenizer.tokenize(query);
        var lastQueryWord = queryArr[queryArr.length - 1];
        var queryLoc = query.substring(query.indexOf('near') + ('near').length, query.length).trim();
        var googleGeocodeAPI = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + queryLoc;
        var selfAddressAPI = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + 'Tidewater Trail, VA';

        if (lastQueryWord == 'me' || lastQueryWord == 'nearby' || lastQueryWord == 'area' || lastQueryWord == 'atms') {
          request.get(selfAddressAPI).end(function(err, res) {
            if (!err) {
              var location = res.body.results[0].geometry.location;
              var fullURL = baseURL + '/atms?lat=' + location.lat + '&lng=' + location.lng + '&rad=100&key=' + API_KEY;

              request.get(fullURL).end(function(err, res) {
                var responseText;
                if (!err) {
                  if(res.body.data.length > 0) {
                    var locationNum = Math.floor(Math.random() * res.body.data.length);
                    var location = res.body.data[locationNum].address;
                    responseText = "We found an ATM near you" + ", located at " + location.street_number + " " + location.street_name + ", " + location.city + ", " + location.state + " " + location.zip;
                    resolve(responseText);
                  } else {
                    responseText = "Sorry, we could not find any ATMs that are sufficiently close to your location.";
                    resolve(responseText);
                  }
                }
              });
            }
          });
        } else {
          request.get(googleGeocodeAPI).end(function(err, res) {
            if (!err) {
              var location = res.body.results[0].geometry.location;
              var fullURL = baseURL + '/atms?lat=' + location.lat + '&lng=' + location.lng + '&rad=100&key=' + API_KEY;

              request.get(fullURL).end(function(err, res) {
                var responseText;
                if (!err) {
                  if(res.body.data.length > 0) {
                    var locationNum = Math.floor(Math.random() * res.body.data.length);
                    var location = res.body.data[locationNum].address;
                    responseText = "We found an ATM near " + queryLoc + ", located at " + location.street_number + " " + location.street_name + ", " + location.city + ", " + location.state + " " + location.zip;
                    resolve(responseText);
                  } else {
                    responseText = "Sorry, we could not find any ATMs that are sufficiently close to " + queryLoc;
                    resolve(responseText);
                  }
                }
              });
            }
          });
        }
        break;

      case 'merchants':
        var queryArr = tokenizer.tokenize(query);
        var lastQueryWord = queryArr[queryArr.length - 1];
        var queryLoc = query.substring(query.indexOf('near') + ('near').length, query.length).trim();
        var googleGeocodeAPI = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + queryLoc;
        var selfAddressAPI = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + 'Tidewater Trail, VA';

        if (lastQueryWord == 'me' || lastQueryWord == 'nearby' || lastQueryWord == 'area' || lastQueryWord == 'atms') {
          request.get(selfAddressAPI).end(function(err, res) {
            if (!err) {
              var location = res.body.results[0].geometry.location;
              var fullURL = baseURL + '/merchants?lat=' + location.lat + '&lng=' + location.lng + '&rad=100&key=' + API_KEY;

              request.get(fullURL).end(function(err, res) {
                var responseText;
                if (!err) {
                  if(res.body.length > 0) {
                    var locationNum = Math.floor(Math.random() * res.body.length);
                    var location = res.body[locationNum].geocode;
                    var typeMerchant = res.body[locationNum].name;
                    responseText = "We found a " + typeMerchant + " near you" + ", located at " + location.lat + " latitude, and " + location.lng + " longitude.";
                    resolve(responseText);
                  } else {
                    responseText = "Sorry, we could not find any merchants that are sufficiently close to your location.";
                    resolve(responseText);
                  }
                }
              });
            }
          });
        } else {
          request.get(googleGeocodeAPI).end(function(err, res) {
            if (!err) {
              var location = res.body.results[0].geometry.location;
              var fullURL = baseURL + '/merchants?lat=' + location.lat + '&lng=' + location.lng + '&rad=100&key=' + API_KEY;

              request.get(fullURL).end(function(err, res) {
                var responseText;
                if (!err) {
                  if(res.body.length > 0) {
                    var locationNum = Math.floor(Math.random() * res.body.length);
                    var location = res.body[locationNum].geocode;
                    var typeMerchant = res.body[locationNum].name;
                    responseText = "We found a " + typeMerchant + " near " + queryLoc + ", located at " + location.lat + " latitude, and " + location.lng + " longitude.";
                    resolve(responseText);
                  } else {
                    responseText = "Sorry, we could not find any merchants that are sufficiently close to " + queryLoc;
                    resolve(responseText);
                  }
                }
              });
            }
          });
        }
        break;

      case 'bills':
        var fullURL = baseURL + '/accounts/' + savingsAccountID + "/bills?key=" + API_KEY;
        request.get(fullURL).end(function(err, res) {
          if (!err) {
            var data = JSON.parse(res.text);
            var responseText = "We found your bills. You have ";
            for (var i = 0; i < data.length; i++) {
              var currBill = data[i];
              responseText += ("a bill on " + currBill.payment_date + " where you owe $" + currBill.payment_amount + " for " + currBill.nickname);
              if (i === data.length - 1) {
                responseText += ".";
                resolve(responseText);
              } else {
                responseText += " and ";
              }
            }
          } else {
            resolve("Looks like an error occurred while getting your bills. Please try again.");
          }
        });
        break;

      case 'deposits':
        var fullURL = baseURL + '/accounts/' + savingsAccountID + "/deposits?key=" + API_KEY;
        request.get(fullURL).end(function(err, res) {
          if (!err) {
            var data = JSON.parse(res.text);
            var responseText = "We found all your deposits. You have ";
            for (var i = 0; i < data.length; i++) {
              var currDeposit = data[i];
              responseText += ("a deposit in the amount of $" + currDeposit.amount + " for " + currDeposit.description);
              if (i === data.length - 1) {
                responseText += ".";
                resolve(responseText);
              } else {
                responseText += " and ";
              }
            }
          } else {
            resolve("Looks like an error occurred while getting your deposits. Please try again.");
          }
        });
        break;

      case 'purchases':
        var fullURL = baseURL + '/accounts/' + savingsAccountID + "/purchases?key=" + API_KEY;
        request.get(fullURL).end(function(err, res) {
          if (!err) {
            var data = JSON.parse(res.text);
            var responseText = "We found all your purchases. You have ";
            for (var i = 0; i < data.length; i++) {
              var currPurchase = data[i];
              responseText += ("a purchase on " + currPurchase.purchase_date + " in the amount of $" + currPurchase.amount + " for " + currPurchase.description);
              if (i === data.length - 1) {
                responseText += ".";
                resolve(responseText);
              } else {
                responseText += " and ";
              }
            }
          } else {
            resolve("Looks like an error occurred while getting your purchases. Please try again.");
          }
        });
        break;

      case 'withdrawals':
        var fullURL = baseURL + '/accounts/' + savingsAccountID + "/withdrawals?key=" + API_KEY;
        request.get(fullURL).end(function(err, res) {
          if (!err) {
            var data = JSON.parse(res.text);
            var responseText = "We have discovered your withdrawals. You have ";
            for (var i = 0; i < data.length; i++) {
              var currTransfer = data[i];
              responseText += ("a withdrawal on " + currTransfer.transaction_date + " in the amount of $" + currTransfer.amount + " for " + currTransfer.description);
              if (i === data.length - 1) {
                responseText += ".";
                resolve(responseText);
              } else {
                responseText += " and ";
              }
            }
          } else {
            resolve("Looks like an error occurred while getting your withdrawals. Please try again.");
          }
        });
        break;

      case 'transfers':
        var fullURL = baseURL + '/accounts/' + savingsAccountID + "/transfers?key=" + API_KEY;
        request.get(fullURL).end(function(err, res) {
          if (!err) {
            var data = JSON.parse(res.text);
            var responseText = "We found all your transfers! You have ";
            for (var i = 0; i < data.length; i++) {
              var currTransfer = data[i];
              responseText += ("a transfer on " + currTransfer.transaction_date + " in the amount of $" + currTransfer.amount + " for " + currTransfer.description);
              if (i === data.length - 1) {
                responseText += ".";
                resolve(responseText);
              } else {
                responseText += " and ";
              }
            }
          } else {
            resolve("Looks like an error occurred while getting your transfers. Please try again.");
          }
        });
        break;

      default:
        resolve("I'm sorry I don't know how to respond to that. Please try another query.");
        break;
    }
  });
}

SP500_COMPANIES = [{"Symbol":"MMM","Name":"3M Co","Sector":"Industrials"},{"Symbol":"ABT","Name":"Abbott Laboratories","Sector":"Health Care"},{"Symbol":"ABBV","Name":"AbbVie","Sector":"Health Care"},{"Symbol":"ACN","Name":"Accenture Plc","Sector":"Information Technology"},{"Symbol":"ACE","Name":"ACE Limited","Sector":"Financials"},{"Symbol":"ACT","Name":"Actavis Plc","Sector":"Health Care"},{"Symbol":"ADBE","Name":"Adobe Systems","Sector":"Information Technology"},{"Symbol":"ADT","Name":"ADT Corp (The)","Sector":"Industrials"},{"Symbol":"AES","Name":"AES Corp","Sector":"Utilities"},{"Symbol":"AET","Name":"Aetna","Sector":"Health Care"},{"Symbol":"AMG","Name":"Affiliated Managers Group","Sector":"Financials"},{"Symbol":"AFL","Name":"AFLAC","Sector":"Financials"},{"Symbol":"A","Name":"Agilent Technologies","Sector":"Health Care"},{"Symbol":"GAS","Name":"AGL Resources","Sector":"Utilities"},{"Symbol":"APD","Name":"Air Products & Chemicals","Sector":"Materials"},{"Symbol":"ARG","Name":"Airgas","Sector":"Materials"},{"Symbol":"AKAM","Name":"Akamai Technologies","Sector":"Information Technology"},{"Symbol":"AA","Name":"Alcoa","Sector":"Materials"},{"Symbol":"ALXN","Name":"Alexion Pharmaceuticals","Sector":"Health Care"},{"Symbol":"ALLE","Name":"Allegion Plc","Sector":"Industrials"},{"Symbol":"AGN","Name":"Allergan","Sector":"Health Care"},{"Symbol":"ADS","Name":"Alliance Data Systems","Sector":"Information Technology"},{"Symbol":"ALL","Name":"Allstate Corp","Sector":"Financials"},{"Symbol":"ALTR","Name":"Altera Corp","Sector":"Information Technology"},{"Symbol":"MO","Name":"Altria Group","Sector":"Consumer Staples"},{"Symbol":"AMZN","Name":"Amazon.com","Sector":"Consumer Discretionary"},{"Symbol":"AEE","Name":"Ameren Corp","Sector":"Utilities"},{"Symbol":"AEP","Name":"American Electric Power","Sector":"Utilities"},{"Symbol":"AXP","Name":"American Express","Sector":"Financials"},{"Symbol":"AIG","Name":"American International Group","Sector":"Financials"},{"Symbol":"AMT","Name":"American Tower","Sector":"Financials"},{"Symbol":"AMP","Name":"Ameriprise Financial","Sector":"Financials"},{"Symbol":"ABC","Name":"AmerisourceBergen Corp","Sector":"Health Care"},{"Symbol":"AME","Name":"AMETEK","Sector":"Industrials"},{"Symbol":"AMGN","Name":"Amgen","Sector":"Health Care"},{"Symbol":"APH","Name":"Amphenol Corp A","Sector":"Information Technology"},{"Symbol":"APC","Name":"Anadarko Petroleum","Sector":"Energy"},{"Symbol":"ADI","Name":"Analog Devices","Sector":"Information Technology"},{"Symbol":"AON","Name":"Aon Plc","Sector":"Financials"},{"Symbol":"APA","Name":"Apache Corp","Sector":"Energy"},{"Symbol":"AIV","Name":"Apartment Investment & Mgmt","Sector":"Financials"},{"Symbol":"AAPL","Name":"Apple","Sector":"Information Technology"},{"Symbol":"AMAT","Name":"Applied Materials","Sector":"Information Technology"},{"Symbol":"ADM","Name":"Archer-Daniels-Midland","Sector":"Consumer Staples"},{"Symbol":"AIZ","Name":"Assurant","Sector":"Financials"},{"Symbol":"T","Name":"AT&T","Sector":"Telecommunication Services"},{"Symbol":"ADSK","Name":"Autodesk","Sector":"Information Technology"},{"Symbol":"ADP","Name":"Automatic Data Processing","Sector":"Information Technology"},{"Symbol":"AN","Name":"AutoNation","Sector":"Consumer Discretionary"},{"Symbol":"AZO","Name":"AutoZone","Sector":"Consumer Discretionary"},{"Symbol":"AVGO","Name":"Avago Technologies","Sector":"Information Technology"},{"Symbol":"AVB","Name":"AvalonBay Communities","Sector":"Financials"},{"Symbol":"AVY","Name":"Avery Dennison Corp","Sector":"Materials"},{"Symbol":"AVP","Name":"Avon Products","Sector":"Consumer Staples"},{"Symbol":"BHI","Name":"Baker Hughes","Sector":"Energy"},{"Symbol":"BLL","Name":"Ball Corp","Sector":"Materials"},{"Symbol":"BAC","Name":"Bank of America","Sector":"Financials"},{"Symbol":"BK","Name":"Bank of New York Mellon","Sector":"Financials"},{"Symbol":"BCR","Name":"Bard (C.R.)","Sector":"Health Care"},{"Symbol":"BAX","Name":"Baxter International","Sector":"Health Care"},{"Symbol":"BBT","Name":"BB&T Corp","Sector":"Financials"},{"Symbol":"BDX","Name":"Becton Dickinson","Sector":"Health Care"},{"Symbol":"BBBY","Name":"Bed Bath & Beyond","Sector":"Consumer Discretionary"},{"Symbol":"BMS","Name":"Bemis Co","Sector":"Materials"},{"Symbol":"BRK-B","Name":"Berkshire Hathaway","Sector":"Financials"},{"Symbol":"BBY","Name":"Best Buy","Sector":"Consumer Discretionary"},{"Symbol":"BIIB","Name":"Biogen Idec","Sector":"Health Care"},{"Symbol":"BLK","Name":"BlackRock","Sector":"Financials"},{"Symbol":"BA","Name":"Boeing Co","Sector":"Industrials"},{"Symbol":"BWA","Name":"Borg Warner","Sector":"Consumer Discretionary"},{"Symbol":"BXP","Name":"Boston Properties","Sector":"Financials"},{"Symbol":"BSX","Name":"Boston Scientific","Sector":"Health Care"},{"Symbol":"BMY","Name":"Bristol-Myers Squibb","Sector":"Health Care"},{"Symbol":"BRCM","Name":"Broadcom Corp","Sector":"Information Technology"},{"Symbol":"BF-B","Name":"Brown-Forman","Sector":"Consumer Staples"},{"Symbol":"CHRW","Name":"C.H. Robinson Worldwide","Sector":"Industrials"},{"Symbol":"CA","Name":"CA","Sector":"Information Technology"},{"Symbol":"CVC","Name":"Cablevision Systems","Sector":"Consumer Discretionary"},{"Symbol":"COG","Name":"Cabot Oil & Gas","Sector":"Energy"},{"Symbol":"CAM","Name":"Cameron International","Sector":"Energy"},{"Symbol":"CPB","Name":"Campbell Soup","Sector":"Consumer Staples"},{"Symbol":"COF","Name":"Capital One Financial","Sector":"Financials"},{"Symbol":"CAH","Name":"Cardinal Health","Sector":"Health Care"},{"Symbol":"CFN","Name":"CareFusion Corp","Sector":"Health Care"},{"Symbol":"KMX","Name":"CarMax","Sector":"Consumer Discretionary"},{"Symbol":"CCL","Name":"Carnival Corp","Sector":"Consumer Discretionary"},{"Symbol":"CAT","Name":"Caterpillar","Sector":"Industrials"},{"Symbol":"CBG","Name":"CBRE Group","Sector":"Financials"},{"Symbol":"CBS","Name":"CBS Corp","Sector":"Consumer Discretionary"},{"Symbol":"CELG","Name":"Celgene Corp","Sector":"Health Care"},{"Symbol":"CNP","Name":"CenterPoint Energy","Sector":"Utilities"},{"Symbol":"CTL","Name":"CenturyLink","Sector":"Telecommunication Services"},{"Symbol":"CERN","Name":"Cerner Corp","Sector":"Health Care"},{"Symbol":"CF","Name":"CF Industries Holdings","Sector":"Materials"},{"Symbol":"CHK","Name":"Chesapeake Energy","Sector":"Energy"},{"Symbol":"CVX","Name":"Chevron Corp","Sector":"Energy"},{"Symbol":"CMG","Name":"Chipotle Mexican Grill","Sector":"Consumer Discretionary"},{"Symbol":"CB","Name":"Chubb Corp","Sector":"Financials"},{"Symbol":"CI","Name":"Cigna Corp","Sector":"Health Care"},{"Symbol":"XEC","Name":"Cimarex Energy","Sector":"Energy"},{"Symbol":"CINF","Name":"Cincinnati Financial","Sector":"Financials"},{"Symbol":"CTAS","Name":"Cintas Corp","Sector":"Industrials"},{"Symbol":"CSCO","Name":"Cisco Systems","Sector":"Information Technology"},{"Symbol":"C","Name":"Citigroup","Sector":"Financials"},{"Symbol":"CTXS","Name":"Citrix Systems","Sector":"Information Technology"},{"Symbol":"CLX","Name":"Clorox Co","Sector":"Consumer Staples"},{"Symbol":"CME","Name":"CME Group","Sector":"Financials"},{"Symbol":"CMS","Name":"CMS Energy","Sector":"Utilities"},{"Symbol":"COH","Name":"Coach","Sector":"Consumer Discretionary"},{"Symbol":"KO","Name":"Coca-Cola Co","Sector":"Consumer Staples"},{"Symbol":"CCE","Name":"Coca-Cola Enterprises","Sector":"Consumer Staples"},{"Symbol":"CTSH","Name":"Cognizant Technology Solutions","Sector":"Information Technology"},{"Symbol":"CL","Name":"Colgate-Palmolive","Sector":"Consumer Staples"},{"Symbol":"CMCSA","Name":"Comcast Corp","Sector":"Consumer Discretionary"},{"Symbol":"CMA","Name":"Comerica","Sector":"Financials"},{"Symbol":"CSC","Name":"Computer Sciences","Sector":"Information Technology"},{"Symbol":"CAG","Name":"ConAgra Foods","Sector":"Consumer Staples"},{"Symbol":"COP","Name":"ConocoPhillips","Sector":"Energy"},{"Symbol":"CNX","Name":"CONSOL Energy","Sector":"Energy"},{"Symbol":"ED","Name":"Consolidated Edison","Sector":"Utilities"},{"Symbol":"STZ","Name":"Constellation Brands","Sector":"Consumer Staples"},{"Symbol":"GLW","Name":"Corning","Sector":"Information Technology"},{"Symbol":"COST","Name":"Costco Wholesale","Sector":"Consumer Staples"},{"Symbol":"COV","Name":"Covidien Plc","Sector":"Health Care"},{"Symbol":"CCI","Name":"Crown Castle International","Sector":"Financials"},{"Symbol":"CSX","Name":"CSX Corp","Sector":"Industrials"},{"Symbol":"CMI","Name":"Cummins","Sector":"Industrials"},{"Symbol":"CVS","Name":"CVS Health Corp","Sector":"Consumer Staples"},{"Symbol":"DHI","Name":"D.R.Horton","Sector":"Consumer Discretionary"},{"Symbol":"DHR","Name":"Danaher Corp","Sector":"Industrials"},{"Symbol":"DRI","Name":"Darden Restaurants","Sector":"Consumer Discretionary"},{"Symbol":"DVA","Name":"DaVita HealthCare Partner","Sector":"Health Care"},{"Symbol":"DE","Name":"Deere & Co","Sector":"Industrials"},{"Symbol":"DLPH","Name":"Delphi Automotive Plc","Sector":"Consumer Discretionary"},{"Symbol":"DAL","Name":"Delta Air Lines","Sector":"Industrials"},{"Symbol":"DNR","Name":"Denbury Resources","Sector":"Energy"},{"Symbol":"XRAY","Name":"DENTSPLY International","Sector":"Health Care"},{"Symbol":"DVN","Name":"Devon Energy","Sector":"Energy"},{"Symbol":"DO","Name":"Diamond Offshore Drilling","Sector":"Energy"},{"Symbol":"DTV","Name":"DIRECTV","Sector":"Consumer Discretionary"},{"Symbol":"DFS","Name":"Discover Financial Services","Sector":"Financials"},{"Symbol":"DISCA","Name":"Discovery Communications","Sector":"Consumer Discretionary"},{"Symbol":"DG","Name":"Dollar General","Sector":"Consumer Discretionary"},{"Symbol":"DLTR","Name":"Dollar Tree","Sector":"Consumer Discretionary"},{"Symbol":"D","Name":"Dominion Resources","Sector":"Utilities"},{"Symbol":"DOV","Name":"Dover Corp","Sector":"Industrials"},{"Symbol":"DOW","Name":"Dow Chemical","Sector":"Materials"},{"Symbol":"DPS","Name":"Dr. Pepper Snapple Group","Sector":"Consumer Staples"},{"Symbol":"DTE","Name":"DTE Energy","Sector":"Utilities"},{"Symbol":"DD","Name":"Du Pont (E.I.)","Sector":"Materials"},{"Symbol":"DUK","Name":"Duke Energy","Sector":"Utilities"},{"Symbol":"DNB","Name":"Dun & Bradstreet","Sector":"Industrials"},{"Symbol":"ETFC","Name":"E Trade Financial","Sector":"Financials"},{"Symbol":"EMN","Name":"Eastman Chemical","Sector":"Materials"},{"Symbol":"ETN","Name":"Eaton Corp Plc","Sector":"Industrials"},{"Symbol":"EBAY","Name":"eBay","Sector":"Information Technology"},{"Symbol":"ECL","Name":"Ecolab","Sector":"Materials"},{"Symbol":"EIX","Name":"Edison International","Sector":"Utilities"},{"Symbol":"EW","Name":"Edwards Lifesciences","Sector":"Health Care"},{"Symbol":"EA","Name":"Electronic Arts","Sector":"Information Technology"},{"Symbol":"EMC","Name":"EMC Corp","Sector":"Information Technology"},{"Symbol":"EMR","Name":"Emerson Electric","Sector":"Industrials"},{"Symbol":"ESV","Name":"ENSCO Plc","Sector":"Energy"},{"Symbol":"ETR","Name":"Entergy Corp","Sector":"Utilities"},{"Symbol":"EOG","Name":"EOG Resources","Sector":"Energy"},{"Symbol":"EQT","Name":"EQT Corp","Sector":"Energy"},{"Symbol":"EFX","Name":"Equifax","Sector":"Industrials"},{"Symbol":"EQR","Name":"Equity Residential","Sector":"Financials"},{"Symbol":"ESS","Name":"Essex Property Trust","Sector":"Financials"},{"Symbol":"EL","Name":"Estee Lauder Co","Sector":"Consumer Staples"},{"Symbol":"EXC","Name":"Exelon Corp","Sector":"Utilities"},{"Symbol":"EXPE","Name":"Expedia","Sector":"Consumer Discretionary"},{"Symbol":"EXPD","Name":"Expeditors International,Wash","Sector":"Industrials"},{"Symbol":"ESRX","Name":"Express Scripts Holding","Sector":"Health Care"},{"Symbol":"XOM","Name":"Exxon Mobil","Sector":"Energy"},{"Symbol":"FFIV","Name":"F5 Networks","Sector":"Information Technology"},{"Symbol":"FB","Name":"Facebook Cl","Sector":"Information Technology"},{"Symbol":"FDO","Name":"Family Dollar Stores","Sector":"Consumer Discretionary"},{"Symbol":"FAST","Name":"Fastenal Co","Sector":"Industrials"},{"Symbol":"FDX","Name":"FedEx Corp","Sector":"Industrials"},{"Symbol":"FIS","Name":"Fidelity National Information Services","Sector":"Information Technology"},{"Symbol":"FITB","Name":"Fifth Third Bancorp","Sector":"Financials"},{"Symbol":"FSLR","Name":"First Solar","Sector":"Information Technology"},{"Symbol":"FE","Name":"FirstEnergy Corp","Sector":"Utilities"},{"Symbol":"FISV","Name":"Fiserv","Sector":"Information Technology"},{"Symbol":"FLIR","Name":"FLIR Systems","Sector":"Information Technology"},{"Symbol":"FLS","Name":"Flowserve Corp","Sector":"Industrials"},{"Symbol":"FLR","Name":"Fluor Corp","Sector":"Industrials"},{"Symbol":"FMC","Name":"FMC Corp","Sector":"Materials"},{"Symbol":"FTI","Name":"FMC Technologies","Sector":"Energy"},{"Symbol":"F","Name":"Ford Motor","Sector":"Consumer Discretionary"},{"Symbol":"FOSL","Name":"Fossil Group","Sector":"Consumer Discretionary"},{"Symbol":"BEN","Name":"Franklin Resources","Sector":"Financials"},{"Symbol":"FCX","Name":"Freeport-McMoRan","Sector":"Materials"},{"Symbol":"FTR","Name":"Frontier Communications","Sector":"Telecommunication Services"},{"Symbol":"GME","Name":"GameStop Corp","Sector":"Consumer Discretionary"},{"Symbol":"GCI","Name":"Gannett Co","Sector":"Consumer Discretionary"},{"Symbol":"GPS","Name":"Gap","Sector":"Consumer Discretionary"},{"Symbol":"GRMN","Name":"Garmin Ltd","Sector":"Consumer Discretionary"},{"Symbol":"GM","Name":"General Motors","Sector":"Consumer Discretionary"},{"Symbol":"GD","Name":"Genl Dynamics","Sector":"Industrials"},{"Symbol":"GE","Name":"Genl Electric","Sector":"Industrials"},{"Symbol":"GGP","Name":"Genl Growth Properties","Sector":"Financials"},{"Symbol":"GIS","Name":"Genl Mills","Sector":"Consumer Staples"},{"Symbol":"GPC","Name":"Genuine Parts","Sector":"Consumer Discretionary"},{"Symbol":"GNW","Name":"Genworth Financial","Sector":"Financials"},{"Symbol":"GILD","Name":"Gilead Sciences","Sector":"Health Care"},{"Symbol":"GS","Name":"Goldman Sachs Group","Sector":"Financials"},{"Symbol":"GT","Name":"Goodyear Tire & Rub","Sector":"Consumer Discretionary"},{"Symbol":"GOOG","Name":"Google'C'","Sector":"Information Technology"},{"Symbol":"GWW","Name":"Grainger (W.W.)","Sector":"Industrials"},{"Symbol":"HAL","Name":"Halliburton Co","Sector":"Energy"},{"Symbol":"HOG","Name":"Harley-Davidson","Sector":"Consumer Discretionary"},{"Symbol":"HAR","Name":"Harman International","Sector":"Consumer Discretionary"},{"Symbol":"HRS","Name":"Harris Corp","Sector":"Information Technology"},{"Symbol":"HIG","Name":"Hartford Finl Services Gp","Sector":"Financials"},{"Symbol":"HAS","Name":"Hasbro","Sector":"Consumer Discretionary"},{"Symbol":"HCP","Name":"HCP","Sector":"Financials"},{"Symbol":"HCN","Name":"Health Care REIT","Sector":"Financials"},{"Symbol":"HP","Name":"Helmerich & Payne","Sector":"Energy"},{"Symbol":"HSY","Name":"Hershey Co","Sector":"Consumer Staples"},{"Symbol":"HES","Name":"Hess Corp","Sector":"Energy"},{"Symbol":"HPQ","Name":"Hewlett-Packard","Sector":"Information Technology"},{"Symbol":"HD","Name":"Home Depot","Sector":"Consumer Discretionary"},{"Symbol":"HON","Name":"Honeywell International","Sector":"Industrials"},{"Symbol":"HRL","Name":"Hormel Foods","Sector":"Consumer Staples"},{"Symbol":"HSP","Name":"Hospira","Sector":"Health Care"},{"Symbol":"HST","Name":"Host Hotels & Resorts","Sector":"Financials"},{"Symbol":"HCBK","Name":"Hudson City Bancorp","Sector":"Financials"},{"Symbol":"HUM","Name":"Humana","Sector":"Health Care"},{"Symbol":"HBAN","Name":"Huntington Bancshares","Sector":"Financials"},{"Symbol":"ITW","Name":"Illinois Tool Works","Sector":"Industrials"},{"Symbol":"IR","Name":"Ingersoll-Rand Plc","Sector":"Industrials"},{"Symbol":"TEG","Name":"Integrys Energy Group","Sector":"Utilities"},{"Symbol":"INTC","Name":"Intel Corp","Sector":"Information Technology"},{"Symbol":"ICE","Name":"Intercontinental Exchange","Sector":"Financials"},{"Symbol":"IBM","Name":"International Bus. Machines","Sector":"Information Technology"},{"Symbol":"IFF","Name":"International Flavors/Fragr","Sector":"Materials"},{"Symbol":"IP","Name":"International Paper","Sector":"Materials"},{"Symbol":"IPG","Name":"Interpublic GroupCompanies","Sector":"Consumer Discretionary"},{"Symbol":"INTU","Name":"Intuit","Sector":"Information Technology"},{"Symbol":"ISRG","Name":"Intuitive Surgical","Sector":"Health Care"},{"Symbol":"IVZ","Name":"INVESCO Ltd","Sector":"Financials"},{"Symbol":"IRM","Name":"Iron Mountain","Sector":"Industrials"},{"Symbol":"JBL","Name":"Jabil Circuit","Sector":"Information Technology"},{"Symbol":"JEC","Name":"Jacobs Engineering Group","Sector":"Industrials"},{"Symbol":"JNJ","Name":"Johnson & Johnson","Sector":"Health Care"},{"Symbol":"JCI","Name":"Johnson Controls","Sector":"Consumer Discretionary"},{"Symbol":"JPM","Name":"JPMorgan Chase & Co","Sector":"Financials"},{"Symbol":"JNPR","Name":"Juniper Networks","Sector":"Information Technology"},{"Symbol":"KSU","Name":"Kansas City Southern","Sector":"Industrials"},{"Symbol":"K","Name":"Kellogg Co","Sector":"Consumer Staples"},{"Symbol":"GMCR","Name":"Keurig Green Mountain","Sector":"Consumer Staples"},{"Symbol":"KEY","Name":"KeyCorp","Sector":"Financials"},{"Symbol":"KMB","Name":"Kimberly-Clark","Sector":"Consumer Staples"},{"Symbol":"KIM","Name":"Kimco Realty","Sector":"Financials"},{"Symbol":"KMI","Name":"Kinder Morgan","Sector":"Energy"},{"Symbol":"KLAC","Name":"KLA-Tencor Corp","Sector":"Information Technology"},{"Symbol":"KSS","Name":"Kohl's Corp","Sector":"Consumer Discretionary"},{"Symbol":"KRFT","Name":"Kraft Foods Group","Sector":"Consumer Staples"},{"Symbol":"KR","Name":"Kroger Co","Sector":"Consumer Staples"},{"Symbol":"LB","Name":"L Brands","Sector":"Consumer Discretionary"},{"Symbol":"LLL","Name":"L-3 Communications Holdings","Sector":"Industrials"},{"Symbol":"LH","Name":"Laboratory Corp American Holdings","Sector":"Health Care"},{"Symbol":"LRCX","Name":"Lam Research","Sector":"Information Technology"},{"Symbol":"LM","Name":"Legg Mason","Sector":"Financials"},{"Symbol":"LEG","Name":"Leggett & Platt","Sector":"Consumer Discretionary"},{"Symbol":"LEN","Name":"Lennar Corp","Sector":"Consumer Discretionary"},{"Symbol":"LUK","Name":"Leucadia National","Sector":"Financials"},{"Symbol":"LLY","Name":"Lilly (Eli)","Sector":"Health Care"},{"Symbol":"LNC","Name":"Lincoln National","Sector":"Financials"},{"Symbol":"LLTC","Name":"Linear Technology Corp","Sector":"Information Technology"},{"Symbol":"LMT","Name":"Lockheed Martin","Sector":"Industrials"},{"Symbol":"L","Name":"Loews Corp","Sector":"Financials"},{"Symbol":"LO","Name":"Lorillard","Sector":"Consumer Staples"},{"Symbol":"LOW","Name":"Lowe'sCompanies","Sector":"Consumer Discretionary"},{"Symbol":"LYB","Name":"LyondellBasell Industries","Sector":"Materials"},{"Symbol":"MTB","Name":"M&T Bank","Sector":"Financials"},{"Symbol":"MAC","Name":"Macerich Co","Sector":"Financials"},{"Symbol":"M","Name":"Macy's","Sector":"Consumer Discretionary"},{"Symbol":"MNK","Name":"Mallinckrodt plc","Sector":"Health Care"},{"Symbol":"MRO","Name":"Marathon Oil","Sector":"Energy"},{"Symbol":"MPC","Name":"Marathon Petroleum","Sector":"Energy"},{"Symbol":"MAR","Name":"Marriott International","Sector":"Consumer Discretionary"},{"Symbol":"MMC","Name":"Marsh & McLennan","Sector":"Financials"},{"Symbol":"MLM","Name":"Martin Marietta Materials","Sector":"Materials"},{"Symbol":"MAS","Name":"Masco Corp","Sector":"Industrials"},{"Symbol":"MA","Name":"MasterCard","Sector":"Information Technology"},{"Symbol":"MAT","Name":"Mattel","Sector":"Consumer Discretionary"},{"Symbol":"MKC","Name":"McCormick & Co","Sector":"Consumer Staples"},{"Symbol":"MCD","Name":"McDonald's Corp","Sector":"Consumer Discretionary"},{"Symbol":"MHFI","Name":"McGraw Hill Financial","Sector":"Financials"},{"Symbol":"MCK","Name":"McKesson Corp","Sector":"Health Care"},{"Symbol":"MJN","Name":"Mead Johnson Nutrition","Sector":"Consumer Staples"},{"Symbol":"MWV","Name":"MeadWestvaco Corp","Sector":"Materials"},{"Symbol":"MDT","Name":"Medtronic","Sector":"Health Care"},{"Symbol":"MRK","Name":"Merck & Co","Sector":"Health Care"},{"Symbol":"MET","Name":"MetLife","Sector":"Financials"},{"Symbol":"KORS","Name":"Michael Kors Holdings","Sector":"Consumer Discretionary"},{"Symbol":"MCHP","Name":"Microchip Technology","Sector":"Information Technology"},{"Symbol":"MU","Name":"Micron Technology","Sector":"Information Technology"},{"Symbol":"MSFT","Name":"Microsoft Corp","Sector":"Information Technology"},{"Symbol":"MHK","Name":"Mohawk Industries","Sector":"Consumer Discretionary"},{"Symbol":"TAP","Name":"Molson Coors Brewing","Sector":"Consumer Staples"},{"Symbol":"MDLZ","Name":"Mondelez International","Sector":"Consumer Staples"},{"Symbol":"MON","Name":"Monsanto Co","Sector":"Materials"},{"Symbol":"MNST","Name":"Monster Beverage","Sector":"Consumer Staples"},{"Symbol":"MCO","Name":"Moody's Corp","Sector":"Financials"},{"Symbol":"MS","Name":"Morgan Stanley","Sector":"Financials"},{"Symbol":"MOS","Name":"Mosaic Co","Sector":"Materials"},{"Symbol":"MSI","Name":"Motorola Solutions","Sector":"Information Technology"},{"Symbol":"MUR","Name":"Murphy Oil","Sector":"Energy"},{"Symbol":"MYL","Name":"Mylan","Sector":"Health Care"},{"Symbol":"NBR","Name":"Nabors Industries","Sector":"Energy"},{"Symbol":"NDAQ","Name":"Nasdaq OMX Group","Sector":"Financials"},{"Symbol":"NOV","Name":"Natl Oilwell Varco","Sector":"Energy"},{"Symbol":"NAVI","Name":"Navient Corp","Sector":"Financials"},{"Symbol":"NTAP","Name":"NetApp","Sector":"Information Technology"},{"Symbol":"NFLX","Name":"NetFlix","Sector":"Consumer Discretionary"},{"Symbol":"NWL","Name":"Newell Rubbermaid","Sector":"Consumer Discretionary"},{"Symbol":"NFX","Name":"Newfield Exploration","Sector":"Energy"},{"Symbol":"NEM","Name":"Newmont Mining","Sector":"Materials"},{"Symbol":"NWSA","Name":"News Corporation","Sector":"Consumer Discretionary"},{"Symbol":"NEE","Name":"NextEra Energy","Sector":"Utilities"},{"Symbol":"NLSN","Name":"Nielsen NV","Sector":"Industrials"},{"Symbol":"NKE","Name":"NIKE","Sector":"Consumer Discretionary"},{"Symbol":"NI","Name":"NiSource","Sector":"Utilities"},{"Symbol":"NE","Name":"Noble Corp","Sector":"Energy"},{"Symbol":"NBL","Name":"Noble Energy","Sector":"Energy"},{"Symbol":"JWN","Name":"Nordstrom","Sector":"Consumer Discretionary"},{"Symbol":"NSC","Name":"Norfolk Southern","Sector":"Industrials"},{"Symbol":"NU","Name":"Northeast Utilities","Sector":"Utilities"},{"Symbol":"NTRS","Name":"Northern Trust","Sector":"Financials"},{"Symbol":"NOC","Name":"Northrop Grumman","Sector":"Industrials"},{"Symbol":"NRG","Name":"NRG Energy","Sector":"Utilities"},{"Symbol":"NUE","Name":"Nucor Corp","Sector":"Materials"},{"Symbol":"NVDA","Name":"NVIDIA Corp","Sector":"Information Technology"},{"Symbol":"ORLY","Name":"O'Reilly Automotive","Sector":"Consumer Discretionary"},{"Symbol":"OXY","Name":"Occidental Petroleum","Sector":"Energy"},{"Symbol":"OMC","Name":"Omnicom Group","Sector":"Consumer Discretionary"},{"Symbol":"OKE","Name":"ONEOK","Sector":"Energy"},{"Symbol":"ORCL","Name":"Oracle Corp","Sector":"Information Technology"},{"Symbol":"OI","Name":"Owens-Illinois","Sector":"Materials"},{"Symbol":"PCAR","Name":"PACCAR","Sector":"Industrials"},{"Symbol":"PH","Name":"Parker-Hannifin","Sector":"Industrials"},{"Symbol":"PDCO","Name":"PattersonCompanies","Sector":"Health Care"},{"Symbol":"PAYX","Name":"Paychex","Sector":"Information Technology"},{"Symbol":"PNR","Name":"Pentair plc","Sector":"Industrials"},{"Symbol":"PBCT","Name":"People's United Financial","Sector":"Financials"},{"Symbol":"POM","Name":"Pepco Holdings","Sector":"Utilities"},{"Symbol":"PEP","Name":"PepsiCo","Sector":"Consumer Staples"},{"Symbol":"PKI","Name":"PerkinElmer","Sector":"Health Care"},{"Symbol":"PRGO","Name":"Perrigo","Sector":"Health Care"},{"Symbol":"PETM","Name":"PETsMART","Sector":"Consumer Discretionary"},{"Symbol":"PFE","Name":"Pfizer","Sector":"Health Care"},{"Symbol":"PCG","Name":"PG&E Corp","Sector":"Utilities"},{"Symbol":"PM","Name":"Philip Morris International","Sector":"Consumer Staples"},{"Symbol":"PSX","Name":"Phillips 66","Sector":"Energy"},{"Symbol":"PNW","Name":"Pinnacle West Capital","Sector":"Utilities"},{"Symbol":"PXD","Name":"Pioneer Natural Resources","Sector":"Energy"},{"Symbol":"PBI","Name":"Pitney Bowes","Sector":"Industrials"},{"Symbol":"PCL","Name":"Plum Creek Timber","Sector":"Financials"},{"Symbol":"PNC","Name":"PNC Financial Services","Sector":"Financials"},{"Symbol":"PPG","Name":"PPG Indus","Sector":"Materials"},{"Symbol":"PPL","Name":"PPL Corp","Sector":"Utilities"},{"Symbol":"PX","Name":"Praxair","Sector":"Materials"},{"Symbol":"PCP","Name":"Precision Castparts","Sector":"Industrials"},{"Symbol":"PCLN","Name":"Priceline Group (The)","Sector":"Consumer Discretionary"},{"Symbol":"PFG","Name":"Principal Financial Group","Sector":"Financials"},{"Symbol":"PG","Name":"Procter & Gamble","Sector":"Consumer Staples"},{"Symbol":"PGR","Name":"Progressive Corp,Ohio","Sector":"Financials"},{"Symbol":"PLD","Name":"Prologis","Sector":"Financials"},{"Symbol":"PRU","Name":"Prudential Financial","Sector":"Financials"},{"Symbol":"PSA","Name":"Public Storage","Sector":"Financials"},{"Symbol":"PEG","Name":"Public Svc Enterprises","Sector":"Utilities"},{"Symbol":"PHM","Name":"PulteGroup","Sector":"Consumer Discretionary"},{"Symbol":"PVH","Name":"PVH Corp","Sector":"Consumer Discretionary"},{"Symbol":"QEP","Name":"QEP Resources","Sector":"Energy"},{"Symbol":"QCOM","Name":"QUALCOMM","Sector":"Information Technology"},{"Symbol":"PWR","Name":"Quanta Services","Sector":"Industrials"},{"Symbol":"DGX","Name":"Quest Diagnostics","Sector":"Health Care"},{"Symbol":"RL","Name":"Ralph Lauren Corp","Sector":"Consumer Discretionary"},{"Symbol":"RRC","Name":"Range Resources","Sector":"Energy"},{"Symbol":"RTN","Name":"Raytheon Co","Sector":"Industrials"},{"Symbol":"RHT","Name":"Red Hat","Sector":"Information Technology"},{"Symbol":"REGN","Name":"Regeneron Pharmaceuticals","Sector":"Health Care"},{"Symbol":"RF","Name":"Regions Financial","Sector":"Financials"},{"Symbol":"RSG","Name":"Republic Services","Sector":"Industrials"},{"Symbol":"RAI","Name":"Reynolds American","Sector":"Consumer Staples"},{"Symbol":"RHI","Name":"Robert Half International","Sector":"Industrials"},{"Symbol":"ROK","Name":"Rockwell Automation","Sector":"Industrials"},{"Symbol":"COL","Name":"Rockwell Collins","Sector":"Industrials"},{"Symbol":"ROP","Name":"Roper Indus","Sector":"Industrials"},{"Symbol":"ROST","Name":"Ross Stores","Sector":"Consumer Discretionary"},{"Symbol":"R","Name":"Ryder System","Sector":"Industrials"},{"Symbol":"SWY","Name":"Safeway","Sector":"Consumer Staples"},{"Symbol":"CRM","Name":"salesforce.com inc","Sector":"Information Technology"},{"Symbol":"SNDK","Name":"SanDisk Corp","Sector":"Information Technology"},{"Symbol":"SCG","Name":"SCANA Corp","Sector":"Utilities"},{"Symbol":"SLB","Name":"Schlumberger Ltd","Sector":"Energy"},{"Symbol":"SCHW","Name":"Schwab(Charles)Corp","Sector":"Financials"},{"Symbol":"SNI","Name":"Scripps Networks Interact","Sector":"Consumer Discretionary"},{"Symbol":"STX","Name":"Seagate Technology Plc","Sector":"Information Technology"},{"Symbol":"SEE","Name":"Sealed Air","Sector":"Materials"},{"Symbol":"SRE","Name":"Sempra Energy","Sector":"Utilities"},{"Symbol":"SHW","Name":"Sherwin-Williams","Sector":"Materials"},{"Symbol":"SIAL","Name":"Sigma-Aldrich","Sector":"Materials"},{"Symbol":"SPG","Name":"Simon Property Group","Sector":"Financials"},{"Symbol":"SJM","Name":"Smucker (J.M.)","Sector":"Consumer Staples"},{"Symbol":"SNA","Name":"Snap-On","Sector":"Industrials"},{"Symbol":"SO","Name":"Southern Co","Sector":"Utilities"},{"Symbol":"LUV","Name":"Southwest Airlines","Sector":"Industrials"},{"Symbol":"SWN","Name":"Southwestern Energy","Sector":"Energy"},{"Symbol":"SE","Name":"Spectra Energy","Sector":"Energy"},{"Symbol":"STJ","Name":"St. Jude Medical","Sector":"Health Care"},{"Symbol":"SWK","Name":"Stanley Black & Decker","Sector":"Industrials"},{"Symbol":"SPLS","Name":"Staples","Sector":"Consumer Discretionary"},{"Symbol":"SBUX","Name":"Starbucks Corp","Sector":"Consumer Discretionary"},{"Symbol":"HOT","Name":"Starwood Hotels&Res World","Sector":"Consumer Discretionary"},{"Symbol":"STT","Name":"State Street Corp","Sector":"Financials"},{"Symbol":"SRCL","Name":"Stericycle","Sector":"Industrials"},{"Symbol":"SYK","Name":"Stryker Corp","Sector":"Health Care"},{"Symbol":"STI","Name":"SunTrust Banks","Sector":"Financials"},{"Symbol":"SYMC","Name":"Symantec Corp","Sector":"Information Technology"},{"Symbol":"SYY","Name":"Sysco Corp","Sector":"Consumer Staples"},{"Symbol":"TROW","Name":"T.Rowe Price Group","Sector":"Financials"},{"Symbol":"TGT","Name":"Target Corp","Sector":"Consumer Discretionary"},{"Symbol":"TEL","Name":"TE Connectivity","Sector":"Information Technology"},{"Symbol":"TE","Name":"TECO Energy","Sector":"Utilities"},{"Symbol":"THC","Name":"Tenet Healthcare","Sector":"Health Care"},{"Symbol":"TDC","Name":"Teradata Corp","Sector":"Information Technology"},{"Symbol":"TSO","Name":"Tesoro Petroleum Co","Sector":"Energy"},{"Symbol":"TXN","Name":"Texas Instruments","Sector":"Information Technology"},{"Symbol":"TXT","Name":"Textron","Sector":"Industrials"},{"Symbol":"TMO","Name":"Thermo Fisher Scientific","Sector":"Health Care"},{"Symbol":"TIF","Name":"Tiffany & Co","Sector":"Consumer Discretionary"},{"Symbol":"TWX","Name":"Time Warner","Sector":"Consumer Discretionary"},{"Symbol":"TWC","Name":"Time Warner Cable","Sector":"Consumer Discretionary"},{"Symbol":"TJX","Name":"TJX Companies","Sector":"Consumer Discretionary"},{"Symbol":"TMK","Name":"Torchmark Corp","Sector":"Financials"},{"Symbol":"TSS","Name":"Total System Services","Sector":"Information Technology"},{"Symbol":"TSCO","Name":"Tractor Supply","Sector":"Consumer Discretionary"},{"Symbol":"RIG","Name":"Transocean Ltd","Sector":"Energy"},{"Symbol":"TRV","Name":"TravelersCompanies","Sector":"Financials"},{"Symbol":"TRIP","Name":"TripAdvisor","Sector":"Consumer Discretionary"},{"Symbol":"FOXA","Name":"Twenty-First Century Fox","Sector":"Consumer Discretionary"},{"Symbol":"TSN","Name":"Tyson Foods","Sector":"Consumer Staples"},{"Symbol":"USB","Name":"U.S. Bancorp","Sector":"Financials"},{"Symbol":"UA","Name":"Under Armour","Sector":"Consumer Discretionary"},{"Symbol":"UNP","Name":"Union Pacific","Sector":"Industrials"},{"Symbol":"UPS","Name":"United Parcel Service","Sector":"Industrials"},{"Symbol":"URI","Name":"United Rentals","Sector":"Industrials"},{"Symbol":"UTX","Name":"United Technologies","Sector":"Industrials"},{"Symbol":"UNH","Name":"UnitedHealth Group","Sector":"Health Care"},{"Symbol":"UHS","Name":"Univl Health Services","Sector":"Health Care"},{"Symbol":"UNM","Name":"Unum Group","Sector":"Financials"},{"Symbol":"URBN","Name":"Urban Outfitters","Sector":"Consumer Discretionary"},{"Symbol":"VLO","Name":"Valero Energy","Sector":"Energy"},{"Symbol":"VAR","Name":"Varian Medical Systems","Sector":"Health Care"},{"Symbol":"VTR","Name":"Ventas","Sector":"Financials"},{"Symbol":"VRSN","Name":"VeriSign","Sector":"Information Technology"},{"Symbol":"VZ","Name":"Verizon Communications","Sector":"Telecommunication Services"},{"Symbol":"VRTX","Name":"Vertex Pharmaceuticals","Sector":"Health Care"},{"Symbol":"VFC","Name":"VF Corp","Sector":"Consumer Discretionary"},{"Symbol":"VIAB","Name":"Viacom","Sector":"Consumer Discretionary"},{"Symbol":"V","Name":"Visa","Sector":"Information Technology"},{"Symbol":"VNO","Name":"Vornado Realty Trust","Sector":"Financials"},{"Symbol":"VMC","Name":"Vulcan Materials","Sector":"Materials"},{"Symbol":"WMT","Name":"Wal-Mart Stores","Sector":"Consumer Staples"},{"Symbol":"WAG","Name":"Walgreen Co","Sector":"Consumer Staples"},{"Symbol":"DIS","Name":"Walt Disney Co","Sector":"Consumer Discretionary"},{"Symbol":"WM","Name":"Waste Management","Sector":"Industrials"},{"Symbol":"WAT","Name":"Waters Corp","Sector":"Health Care"},{"Symbol":"WLP","Name":"WellPoint","Sector":"Health Care"},{"Symbol":"WFC","Name":"Wells Fargo","Sector":"Financials"},{"Symbol":"WDC","Name":"Western Digital","Sector":"Information Technology"},{"Symbol":"WU","Name":"Western Union","Sector":"Information Technology"},{"Symbol":"WY","Name":"Weyerhaeuser Co","Sector":"Financials"},{"Symbol":"WHR","Name":"Whirlpool Corp","Sector":"Consumer Discretionary"},{"Symbol":"WFM","Name":"Whole Foods Market","Sector":"Consumer Staples"},{"Symbol":"WMB","Name":"WilliamsCompanies","Sector":"Energy"},{"Symbol":"WIN","Name":"Windstream Holdings","Sector":"Telecommunication Services"},{"Symbol":"WEC","Name":"Wisconsin Energy Corp","Sector":"Utilities"},{"Symbol":"WYN","Name":"Wyndham Worldwide","Sector":"Consumer Discretionary"},{"Symbol":"WYNN","Name":"Wynn Resorts","Sector":"Consumer Discretionary"},{"Symbol":"XEL","Name":"Xcel Energy","Sector":"Utilities"},{"Symbol":"XRX","Name":"Xerox Corp","Sector":"Information Technology"},{"Symbol":"XLNX","Name":"Xilinx","Sector":"Information Technology"},{"Symbol":"XL","Name":"XL Group Plc","Sector":"Financials"},{"Symbol":"XYL","Name":"Xylem","Sector":"Industrials"},{"Symbol":"YHOO","Name":"Yahoo","Sector":"Information Technology"},{"Symbol":"YUM","Name":"Yum Brands","Sector":"Consumer Discretionary"},{"Symbol":"ZMH","Name":"Zimmer Holdings","Sector":"Health Care"},{"Symbol":"ZION","Name":"Zions Bancorp","Sector":"Financials"},{"Symbol":"ZTS","Name":"Zoetis","Sector":"Health Care"}];

