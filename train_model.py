import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import json

def load_and_preprocess_data():
    df = pd.read_csv('Dataset/train.csv')

    print(f"Dataset shape: {df.shape}")
    print(f"\nMissing values:\n{df.isnull().sum()}")

    df['Gender'].fillna(df['Gender'].mode()[0], inplace=True)
    df['Married'].fillna(df['Married'].mode()[0], inplace=True)
    df['Dependents'].fillna(df['Dependents'].mode()[0], inplace=True)
    df['Self_Employed'].fillna(df['Self_Employed'].mode()[0], inplace=True)
    df['LoanAmount'].fillna(df['LoanAmount'].median(), inplace=True)
    df['Loan_Amount_Term'].fillna(df['Loan_Amount_Term'].mode()[0], inplace=True)
    df['Credit_History'].fillna(df['Credit_History'].mode()[0], inplace=True)

    return df

def encode_features(df):
    label_encoders = {}
    categorical_cols = ['Gender', 'Married', 'Dependents', 'Education',
                       'Self_Employed', 'Property_Area']

    for col in categorical_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        label_encoders[col] = le

    return df, label_encoders

def train_model():
    print("Loading and preprocessing data...")
    df = load_and_preprocess_data()

    print("\nEncoding categorical features...")
    df, label_encoders = encode_features(df)

    X = df.drop(['Loan_ID', 'Loan_Status'], axis=1)
    y = df['Loan_Status'].map({'Y': 1, 'N': 0})

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("\nTraining Random Forest model...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    print(f"\nModel Performance:")
    print(f"Accuracy: {accuracy:.4f}")
    print(f"\nClassification Report:\n{classification_report(y_test, y_pred)}")
    print(f"\nConfusion Matrix:\n{confusion_matrix(y_test, y_pred)}")

    feature_importance = pd.DataFrame({
        'feature': X.columns,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    print(f"\nFeature Importance:\n{feature_importance}")

    print("\nSaving model and encoders...")
    joblib.dump(model, 'model.pkl')
    joblib.dump(label_encoders, 'label_encoders.pkl')

    metadata = {
        'accuracy': float(accuracy),
        'features': list(X.columns),
        'model_type': 'RandomForestClassifier',
        'n_estimators': 100
    }

    with open('model_metadata.json', 'w') as f:
        json.dump(metadata, f, indent=2)

    print("\nModel saved successfully!")
    return model, label_encoders, accuracy

if __name__ == "__main__":
    train_model()
