'use strict';

var xsjs = require('../../lib');
// var xsjs = require('@sap/async-xsjs');
var xsenv = require('@sap/xsenv');

xsenv.loadEnv();

const services = xsenv.getServices({
  hana: { label: 'hana' },
});

var port = process.env.PORT || 4000;
var options = {
  anonymous : true,
  rootDir: '.',
  hana: services.hana
};

xsjs(options).then((rt)=> {
  rt.listen(port, () => {
    console.log('App listening on ' + port); // eslint-disable-line
  });
});
