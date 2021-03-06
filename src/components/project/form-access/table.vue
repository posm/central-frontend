<!--
Copyright 2019 ODK Central Developers
See the NOTICE file at the top-level directory of this distribution and at
https://github.com/opendatakit/central-frontend/blob/master/NOTICE.

This file is part of ODK Central. It is subject to the license terms in
the LICENSE file found in the top-level directory of this distribution and at
https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
including this file, may be copied, modified, propagated, or distributed
except according to the terms contained in the LICENSE file.
-->
<template>
  <div id="project-form-access-table" class="clearfix">
    <table class="table table-frozen"
      :class="{ 'no-field-keys': fieldKeysWithToken.length === 0 }">
      <thead>
        <tr>
          <th>Form</th>
          <th>
            State
            <button type="button" class="btn btn-link"
              @click="$emit('show-states')">
              <span class="icon-question-circle"></span>
            </button>
          </th>
        </tr>
      </thead>
      <tbody v-if="forms.length !== 0">
        <project-form-access-row v-for="form of forms" :key="form.xmlFormId"
          :form="form" :changes="changesByForm[form.xmlFormId]" frozen
          @update:state="updateState"/>
      </tbody>
    </table>
    <div v-if="fieldKeysWithToken.length !== 0" class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th><div>App User Access</div></th>
            <th v-for="fieldKey of fieldKeysWithToken" :key="fieldKey.id"
              :title="fieldKey.displayName">
              <div>{{ fieldKey.displayName }}</div>
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody v-if="forms.length !== 0">
          <project-form-access-row v-for="form of forms" :key="form.xmlFormId"
            :form="form" :changes="changesByForm[form.xmlFormId]"
            @update:field-key-access="updateFieldKeyAccess"/>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import ProjectFormAccessRow from './row.vue';
import { requestData } from '../../../store/modules/request';

export default {
  name: 'ProjectFormAccessTable',
  components: { ProjectFormAccessRow },
  props: {
    changesByForm: {
      type: Object,
      required: true
    }
  },
  computed: {
    ...requestData(['forms']),
    ...mapGetters(['fieldKeysWithToken'])
  },
  methods: {
    updateState(form, state) {
      this.$emit('update:state', form, state);
    },
    updateFieldKeyAccess(form, fieldKey, accessible) {
      this.$emit('update:field-key-access', form, fieldKey, accessible);
    }
  }
};
</script>

<style lang="scss">
@import '../../../assets/scss/variables';

#project-form-access-table {
  // Space above the tables
  .table-frozen {
    margin-top: 70px;

    &.no-field-keys {
      margin-top: 0;
    }
  }
  .table-container {
    // Using padding rather than margin so that the rotated column header text
    // does not overflow the container, which would cause the text to be hidden.
    padding-top: 70px;
  }

  .table {
    table-layout: fixed;

    th {
      height: 33px;
    }

    td {
      height: 51px;
      vertical-align: middle;
    }
  }

  .table-frozen th {
    &:first-child {
      min-width: 250px;
      width: 250px;
    }

    &:nth-child(2) {
      min-width: 200px;
      width: 200px;

      .btn-link {
        padding: 0;

        .icon-question-circle {
          margin-right: 0;
        }
      }
    }
  }

  .table-container .table {
    width: auto;

    thead {
      background-color: transparent;
    }

    th {
      position: relative;

      // The rotated column header text
      div {
        bottom: 2px;
        left: 30px;
        position: absolute;
        transform: rotate(-45deg);
        transform-origin: center left;
        width: 110px;

        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      // The background behind the text
      &::before {
        bottom: 0;
        content: '';
        height: 102px;
        // This seems to need to be height divided by 2.
        left: 51px;
        position: absolute;
        transform: skewX(-45deg);
        transform-origin: center left;
      }
      &, &::before {
        min-width: 42px;
        width: 42px;
      }
      &:first-child {
        &, &::before {
          background-color: $color-table-heading-background;
        }

        &::before {
          border-left: 1px solid #eee;
        }
      }
      &:nth-child(2n + 3)::before {
        background-color: #eee;
      }
      &:last-child::before {
        display: none;
      }

      &:last-child {
        min-width: 102px;
        width: 102px;
      }
    }

    td:nth-child(2n + 3) {
      background-color: #eee;
    }
    td:last-child {
      background-color: transparent;
    }
  }
}
</style>
