package com.hotel.booking.infrastructure.config;

import org.redisson.Redisson;
import org.redisson.api.RedissonClient;
import org.redisson.config.Config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RedissonConfig {

    @Value("${spring.redis.host:10.77.0.11}")
    private String redisHost;

    @Value("${spring.redis.port:31006}")
    private int redisPort;

    @Value("${spring.redis.password:Rg7keCbAMt}")
    private String redisPassword;

    @Bean(destroyMethod = "shutdown")
    public RedissonClient redisson() {
        Config config = new Config();
        String address = "redis://" + redisHost + ":" + redisPort;
        config.useSingleServer()
              .setAddress(address)
              .setPassword(redisPassword);
        return Redisson.create(config);
    }
}
