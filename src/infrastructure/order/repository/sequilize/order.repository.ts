import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface {
  async update(entity: Order): Promise<void> {
    // atualiza os dados do model order
    await OrderModel.update(
      { total: entity.total() },
      { where: { id: entity.id } }
    );

    // remove os registros de items associados
    await OrderItemModel.destroy({ where: { order_id: entity.id } })

    // cria os registros de items associados pelo id da order
    await entity.items.map(async (item: OrderItem) => {
      await OrderItemModel.create({
        id: item.id,
        name: item.name,
        price: item.price,
        product_id: item.productId,
        quantity: item.quantity,
        order_id: entity.id
      });
    });
  }

  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }

  async find(id: string): Promise<Order> {
    const orderModel = await OrderModel.findOne({ where: { id }, include: [{ model: OrderItemModel }] });
    return new Order(
      orderModel.id,
      orderModel.customer_id,
      orderModel.items.map((item: OrderItemModel) => {
        return new OrderItem(
          item.id,
          item.name,
          item.price,
          item.product_id,
          item.quantity
        )
      })
    );
  }

  async findAll(): Promise<Order[]> {
    const orderModels = await OrderModel.findAll({ include: [{ model: OrderItemModel }] });
    return orderModels.map((orderModel) =>
      new Order(
        orderModel.id,
        orderModel.customer_id,
        orderModel.items.map((item: OrderItemModel) => {
          return new OrderItem(
            item.id,
            item.name,
            item.price,
            item.product_id,
            item.quantity
          )
        })
      )
    );
  }
}
