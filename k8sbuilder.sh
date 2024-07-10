cd backend
docker build -t vittoriorossetto/backend:latest .
docker push vittoriorossetto/backend:latest
cd ../frontend
docker build -t vittoriorossetto/frontend:latest .
docker push vittoriorossetto/frontend:latest
cd ../k8s
kubectl apply -f postgres-pvc.yaml
kubectl apply -f postgres-deployment.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml