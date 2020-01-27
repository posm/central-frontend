/*
Copyright 2019 ODK Central Developers
See the NOTICE file at the top-level directory of this distribution and at
https://github.com/opendatakit/central-frontend/blob/master/NOTICE.

This file is part of ODK Central. It is subject to the license terms in
the LICENSE file found in the top-level directory of this distribution and at
https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
including this file, may be copied, modified, propagated, or distributed
except according to the terms contained in the LICENSE file.
*/

const backend = 'http://service:8383';

module.exports = {
  lintOnSave: false,

  devServer: {
    open: process.platform === 'darwin',
    host: '0.0.0.0',
    port: 3383,
    // https: true,
    hotOnly: false,
    proxy: {
      '/v1/': {
        target: backend,
        changeOrigin: true,
        secure: true
      }
    }
  }
};
