import React, { useEffect } from 'react';
import { useStoreActions } from 'easy-peasy';
import { usePromise } from 'promise-hook';
import { apiUrl } from '../baseUrl';

export default function InitializeData() {
  const setGrantees = useStoreActions(dispatch => dispatch.grantees.setGrantees);
  const { isLoading, data: grantees } = usePromise(() => getGalleryData(), {
    resolve: true,
    resolveCondition: []
  });

  useEffect(() => {
    if (grantees && grantees.length) setGrantees(grantees);
  }, [grantees])

  return (<></>);
}

const getGalleryData = () => {
  return fetch(`${ apiUrl() }/galleryData`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  }).then(res => res.json());
}
