# **SimpleQueue Pricing Strategy**

## **Overview**

Based on our cost analysis with the 128KB message size limit, I've developed a pricing strategy that balances competitive positioning, profitability, and scaling considerations. This strategy provides a path to sustainable growth while offering compelling value to customers.

## **Pricing Tiers**

### **Free Tier**

* **Price**: $0/month  
* **Included**:  
  * 100,000 messages/month  
  * 1 queue  
  * 3-day message retention  
  * Basic queue analytics  
  * Email support only  
* **Not Included**:  
  * Custom retention periods  
  * Advanced analytics  
  * Multiple queues  
  * Alerting capabilities  
* **Margins**: Loss leader (customer acquisition)  
* **Capacity Before Upgrade**: \~500 free users on $25 Tinybird plan

### **Starter Tier**

* **Price**: $29/month  
* **Included**:  
  * 500,000 messages/month  
  * Up to 5 queues  
  * 7-day message retention  
  * Standard analytics dashboard  
  * Basic email alerts  
  * Standard support  
* **Not Included**:  
  * Advanced analytics  
  * Custom alert rules  
  * Advanced retention options  
  * Queue prioritization  
* **Margins**: \~5% (near break-even)  
* **Cost**: \~$27.50/month  
* **Capacity Before Upgrade**: \~100 Starter users on $25 Tinybird plan

### **Professional Tier**

* **Price**: $79/month  
* **Included**:  
  * 2 million messages/month  
  * Up to 20 queues  
  * 30-day message retention  
  * Advanced analytics dashboard  
  * Custom alerts and webhooks  
  * Priority support  
  * API key management  
* **Not Included**:  
  * Custom retention beyond 30 days  
  * Anomaly detection  
  * Reserved capacity  
* **Margins**: \~62%  
* **Cost**: \~$30.30/month  
* **Capacity Before Upgrade**: \~25 Professional users on $25 Tinybird plan

### **Business Tier**

* **Price**: $199/month  
* **Included**:  
  * 10 million messages/month  
  * Unlimited queues  
  * 90-day message retention  
  * Full analytics suite  
  * Anomaly detection  
  * Custom alert rules  
  * Dedicated support  
  * Reserved capacity  
  * Multiple team members  
* **Not Included**:  
  * Enterprise integrations  
  * Custom contracts  
  * SLA guarantees  
* **Margins**: \~85%  
* **Cost**: \~$31.50/month  
* **Capacity Before Upgrade**: \~8-10 Business users on $25 Tinybird plan

## **Infrastructure Upgrade Triggers**

### **Tinybird Upgrade (from $25 to $49 plan)**

* **Trigger**: When reaching 70-75% of 10 QPS capacity during peak hours  
* **Customer Threshold**:  
  * \~25-30 paying customers across tiers, or  
  * \~8-10 Business tier customers, or  
  * Total monthly message volume exceeding 100M

### **Supabase Upgrade (from Free tier to $25 Pro)**

* **Trigger**: When reaching either:  
  * \~10-15 paying customers  
  * \~$300 MRR  
  * Database size approaching 300MB  
  * Any production-level customer relying on the service

## **Margin Profile By Scale**

| MRR Level | Avg. Cost | Effective Margin | Infrastructure |
| ----- | ----- | ----- | ----- |
| $500 | \~$35 | \~93% | Free Supabase \+ $25 Tinybird |
| $1,500 | \~$60 | \~96% | $25 Supabase \+ $25 Tinybird |
| $3,000 | \~$85 | \~97% | $25 Supabase \+ $49 Tinybird |
| $10,000 | \~$200 | \~98% | $25 Supabase \+ Multiple Tinybird plans |

## **Pricing Strategy Notes**

1. **Free Tier Strategy**: The free tier serves as a lead generation tool with strict limitations that encourage upgrading. The 3-day retention and single queue limit provide just enough functionality to demonstrate value.  
2. **Starter Tier Strategy**: This tier is priced to be accessible while covering costs. It's designed for small projects and solo developers who need more than the free tier but have limited budgets.  
3. **Professional Tier Strategy**: This tier offers the best value-to-price ratio and should be our primary conversion target. It includes the analytics capabilities that differentiate SimpleQueue from alternatives.  
4. **Business Tier Strategy**: This tier is designed for companies with serious messaging needs who value the monitoring capabilities. The high margins help subsidize the lower tiers.  
5. **Volume Overages**: All paid plans will charge for overages at the following rates:  
   * Starter: $0.06 per 1,000 messages over limit  
   * Professional: $0.05 per 1,000 messages over limit  
   * Business: $0.04 per 1,000 messages over limit

This pricing structure allows SimpleQueue to be profitable even with a small customer base while providing a clear upgrade path as customer needs grow. The free tier enables broad adoption, while the paid tiers offer increasing levels of analytics and reliability features that justify the premium pricing compared to basic queue services.

