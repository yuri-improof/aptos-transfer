# Aptos Transfer (EN)

## General Information

Software for transferring APT to any address in the Aptos network. Initially developed for withdrawing APT from wallet addresses to exchange addresses.

creator: Yuri IMPROOF🧩

## 📝Input Your Data

> All required data should be specified in `./data`.

1. **private_keys.txt** - private keys of Aptos wallets
2. **cex_addresses.txt** - exchange addresses for APT transfer

1 wallet from **private_keys.txt** will correspondingly send APT to 1 wallet from **cex_addresses.txt**.

## ⚙️Software Configuration

> All settings are located in the `./src/config.ts` file.

1. `THREADS_COUNT` - the number of wallets that will be processed simultaneously.
2. `SLEEP_BETWEEN_THREADS` - sleep time between threads in seconds [minimum, maximum]
3. `PRIVATE_KEYS_RANDOM_MOD` - randomization mode for private keys. There are 3 modes:
   1. **consecutive** - sequential order of private keys
   2. **shuffle** - random order of private keys
4. `TRANSFER_AMOUNT` - amount of APT for transfer. In APT units - [0.01, 0.02] or as a percentage of the total balance - ["10", "20"] ⚠️ Values are in quotes. Using 100% of the balance will prevent the transfer. 99% of the balance is sufficient for the transfer in most cases.
5. `RPC_URL` - Aptos RPC. No need to change.

## 🛠️Project Installation and Launch

[Node.js](http://nodejs.org/) is required for operation. Download the LTS version.

To install the necessary libraries, run the following command in the console:

```bash
  npm install
```

To start the project, run:

```bash
  npm run start
```

# Aptos Transfer (RU)

## Общая информация

Софт для трансфера APT на любые адреса в сети Aptos. Изначально написан для вывода APT с адресов кошельков на адреса бирж.

creator: Юрий IMPROOF🧩

## 📝Ввод своих данных

> Все нужные данные необходимо указать в `./data`.

1.  **private_keys.txt** - приватные ключи от кошельков Aptos
2.  **cex_addresses.txt** - адреса бирж для трансфера APT

1 кошелек из **private_keys.txt** соответственно отправит APT 1 кошельку из **cex_addresses.txt**.

## ⚙️Настройка софта

> Все настройки вынесены в файл `./src/config.ts`.

1. `THREADS_COUNT` - количество кошельков, которые будут выполняться одновременно.
2. `SLEEP_BETWEEN_THREADS` - время сна между потоками в секундах [минимум, максимум]
3. `PRIVATE_KEYS_RANDOM_MOD` - режим рандома приватных ключей. Есть всего 3 режима:
   1. **consecutive** - прямой порядок приватных ключей
   2. **shuffle** - рандомный порядок приватных ключей
4. `TRANSFER_AMOUNT` - сумма APT для трансфера. В количестве APT - [0.01, 0.02] или в процентах от общего баланса - ["10", "20"] ⚠️ Значения в кавычках. Использование 100% баланса приведет к невозможности трансфера. 99% баланса достаточно для трансфера в большинстве случаев.
5. `RPC_URL` - RPC Aptos. Менять не стоит.

## 🛠️Установка и запуск проекта

Для работы необходим [Node.js](http://nodejs.org/), скачайте LTS версию.

Для установки необходимых библиотек, пропишите в консоль:

```bash
  npm install
```

Запуск проекта:

```bash
  npm run start
```
