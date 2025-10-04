
# 📱 **Clean Architecture in React Native**  

![Clean Architecture](./clean_architecture.jpg)  
*Optional: Add an image named `clean_architecture.jpg` inside the `assets` folder.*

This guide explains how to apply Clean Architecture principles in a React Native app, focusing on three main layers: **Data**, **Domain**, and **Presentation**.  
We'll also cover best practices, do's and don'ts, and show examples from the **Movie List App**.  

---

## 🏗️ **Layers of Clean Architecture**  

### 1. **Domain Layer** (Core Business Logic)  
- Independent of frameworks and external libraries.  
- Contains **use cases** and **entities**.  

**✅ Do's**  
- Keep this layer pure and free from UI or API logic.  
- Use descriptive names for use cases (e.g., `GetMoviesUseCase`).  
- Handle all business rules here.  

**❌ Don’ts**  
- Avoid direct API or database access.  
- No React Native dependencies here.  

**Code Example:**  
```typescript
// src/domain/usecases/GetMoviesUseCase.ts
import { Movie } from '../entities/Movie';
import { MovieRepository } from '../repositories/MovieRepository';

export class GetMoviesUseCase {
  constructor(private repository: MovieRepository) {}

  async execute(): Promise<Movie[]> {
    return await this.repository.getMovies();
  }
}
```

---

### 2. **Data Layer** (Data Management)  
- Responsible for retrieving and storing data from APIs, databases, or local storage.  
- Includes **repositories**, **data sources**, and **DTOs**.  

**✅ Do's**  
- Map raw API data to domain entities using DTOs.  
- Handle network and storage logic here.  
- Implement interfaces defined in the domain layer.  

**❌ Don’ts**  
- Don’t expose API responses directly to the domain or presentation layers.  
- Avoid complex business logic here.  

**Code Example:**  
```typescript
// src/data/repositories/MovieRepositoryImpl.ts
import { Movie } from '../../domain/entities/Movie';
import { MovieRepository } from '../../domain/repositories/MovieRepository';
import { MovieApiDataSource } from '../datasources/MovieApiDataSource';

export class MovieRepositoryImpl implements MovieRepository {
  constructor(private apiDataSource: MovieApiDataSource) {}

  async getMovies(): Promise<Movie[]> {
    const moviesDto = await this.apiDataSource.fetchMovies();
    return moviesDto.map(dto => new Movie(dto.id, dto.title, dto.poster));
  }
}
```

---

### 3. **Presentation Layer** (UI and User Interaction)  
- Responsible for displaying data and handling user input.  
- Includes **screens**, **components**, **view models**, and **styles**.  

**✅ Do's**  
- Keep components focused on UI logic only.  
- Use view models to separate UI logic from components.  
- Use centralized styles for consistency.  

**❌ Don’ts**  
- Don’t call APIs directly from components.  
- Avoid complex business logic in the UI.  

**Code Example:**  
```typescript
// src/presentation/screens/MovieListScreen.tsx
import React, { useEffect } from 'react';
import { FlatList, Text, View } from 'react-native';
import { MovieCard } from '../components/MovieCard';
import { useMovieListViewModel } from '../viewmodels/MovieListViewModel';
import styles from '../styles/MovieListStyles.style';

const MovieListScreen = () => {
  const { movies, loadMovies } = useMovieListViewModel();

  useEffect(() => {
    loadMovies();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={movies}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <MovieCard movie={item} />}
      />
    </View>
  );
};

export default MovieListScreen;
```

---

## 💡 **Best Practices for Each Layer**  

- **Domain:** Keep it framework-agnostic.  
- **Data:** Isolate data transformation and API logic.  
- **Presentation:** Use hooks and view models to simplify components.  

---

## ⚠️ **Common Mistakes to Avoid**  
- Mixing layers (e.g., calling APIs in components).  
- Tight coupling between components and data sources.  
- Overcomplicating the domain layer for simple apps.  

---

## 🌱 **Folder Structure**  
```
src
├── data
│   ├── datasources
│   ├── repositories
│   └── dtos
├── domain
│   ├── entities
│   ├── repositories
│   └── usecases
└── presentation
    ├── components
    ├── screens
    ├── styles
    └── viewmodels
```

---

## 🎯 **Conclusion**  
Applying Clean Architecture in React Native ensures better maintainability, testability, and scalability of your app. By separating concerns into distinct layers, you create a more modular and flexible codebase.  

🚀 **Use this structure as a foundation for your future React Native projects!**  
