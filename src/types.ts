// src/types.ts

export type RootStackParamList = {
    MovieList: undefined;
    MovieDetail: { movieId: string }; // MovieDetail screen expects a movieId param
  };
