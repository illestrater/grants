import { StoreProvider, createStore, persist, action } from "easy-peasy";

export const StoreComponent = StoreProvider;
export const store = createStore(
  persist(
    {
      user: {
        auth: {},
        setAuth: action((state, payload) => {
          return {
            ...state,
            auth: payload,
          };
        }),
      },
      app: {
        small: false,
        setSmall: action((state, payload) => {
          return {
            ...state,
            small: payload,
          };
        }),
        cols: "1",
        setCols: action((state, payload) => {
          return {
            ...state,
            cols: payload,
          };
        }),
      },
      eth: {
        provider: null,
        setProvider: action((state, payload) => {
          return {
            ...state,
            provider: payload,
          };
        }),
      },
    },
    {
      storage: "localStorage",
    }
  )
);
