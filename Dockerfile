FROM 422391363513.dkr.ecr.us-east-1.amazonaws.com/agenda-core-dev:node-20
WORKDIR /usr

COPY . .

RUN yarn cache clean

RUN yarn

RUN yarn build

# Copiar el script de construcción al directorio de trabajo y darle permisos para Ejecutar el análisis de SonarQube
#RUN chmod 777 build.sh && ./build.sh 
# análisis de SonarQube
#RUN sonar-scanner

CMD [ "yarn", "start" ]

EXPOSE 8080:8080